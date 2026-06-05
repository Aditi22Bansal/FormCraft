const Form = require('../models/Form');
const Response = require('../models/Response');
const Comment = require('../models/Comment');
const { canAccessForm } = require('../middleware/auth');
const { escapeCsv } = require('../utils/fieldLogic');
const { calculateHealthScore } = require('../services/healthScore');
const { getActiveSessions } = require('../socket/sessionTracker');
const { success, fail } = require('../utils/apiResponse');

exports.getResponses = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);
    const responses = await Response.find({ formId: form._id }).sort({ submittedAt: -1 });
    return success(res, responses);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) return fail(res, 'Response not found', 404);
    const form = await Form.findById(response.formId);
    if (!form || !canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);
    return success(res, { response, form });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);
    const responses = await Response.find({ formId: form._id }).sort({ submittedAt: -1 });
    const headers = ['Submitted At', 'Completion Time', 'Score', 'Flagged', ...form.fields.map((f) => f.label || f.id)];
    const rows = responses.map((r) => {
      const row = [
        new Date(r.submittedAt).toISOString(),
        r.completionTime,
        r.score != null ? `${r.score}/${r.scoreTotal}` : '',
        r.anomalySummary?.flagged ? 'Yes' : 'No',
      ];
      form.fields.forEach((field) => {
        const answer = r.answers.find((a) => a.fieldId === field.id);
        let value = answer?.value ?? '';
        if (Array.isArray(value)) value = value.join('; ');
        row.push(escapeCsv(String(value)));
      });
      return row.join(',');
    });
    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-responses.csv"`);
    return res.send(csv);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);

    const responses = await Response.find({ formId: form._id }).sort({ submittedAt: -1 });
    const totalSubmissions = responses.length;
    const totalViews = form.viewCount || 0;
    const completionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;
    const avgCompletionTime = totalSubmissions
      ? Math.round(responses.reduce((s, r) => s + (r.completionTime || 0), 0) / totalSubmissions) : 0;

    const trends = await Response.aggregate([
      { $match: { formId: form._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    const dropOff = form.fields.map((field, idx) => {
      const reached = responses.filter((r) =>
        r.answers.some((a) => a.fieldId === field.id && a.value !== '' && a.value != null)
      ).length;
      const pct = totalSubmissions ? Math.round((reached / totalSubmissions) * 100) : 0;
      return { fieldId: field.id, label: field.label || `Field ${idx + 1}`, percentage: pct, dropOff: 100 - pct };
    });

    const choiceDistribution = {};
    form.fields.filter((f) => ['dropdown', 'radio', 'checkbox'].includes(f.type)).forEach((field) => {
      const dist = {};
      (field.options || []).forEach((opt) => { dist[opt] = 0; });
      responses.forEach((r) => {
        const ans = r.answers.find((a) => a.fieldId === field.id);
        if (!ans) return;
        if (Array.isArray(ans.value)) ans.value.forEach((v) => { if (dist[v] !== undefined) dist[v]++; });
        else if (dist[ans.value] !== undefined) dist[ans.value]++;
      });
      choiceDistribution[field.id] = { label: field.label, data: Object.entries(dist).map(([name, count]) => ({ name, count })) };
    });

    const sentimentByField = {};
    form.fields.filter((f) => ['text', 'textarea'].includes(f.type)).forEach((field) => {
      const counts = { positive: 0, neutral: 0, negative: 0 };
      responses.forEach((r) => {
        const ans = r.answers.find((a) => a.fieldId === field.id);
        if (ans?.sentiment?.label) counts[ans.sentiment.label]++;
      });
      sentimentByField[field.id] = { label: field.label, counts };
    });

    const sourceBreakdown = {};
    responses.forEach((r) => {
      const src = r.source || r.referrer || 'Direct';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    });

    const flagged = responses.filter((r) => r.anomalySummary?.flagged);
    const anomalies = flagged.map((r) => ({
      id: r._id,
      reasons: r.anomalySummary.reasons,
      confidence: r.anomalySummary.confidence,
      submittedAt: r.submittedAt,
    }));

    const leaderboard = responses
      .filter((r) => r.score != null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => ({ id: r._id, score: r.score, total: r.scoreTotal, time: r.completionTime }));

    const health = calculateHealthScore({
      fields: form.fields,
      completionRate,
      avgTime: avgCompletionTime,
      dropOff,
      sentimentByField,
      responses,
    });

    const liveSessions = getActiveSessions(form._id.toString());

    return success(res, {
      stats: { totalViews, totalSubmissions, completionRate, avgCompletionTime },
      health,
      trends,
      dropOff,
      choiceDistribution,
      sentimentByField,
      sourceBreakdown,
      anomalies,
      leaderboard,
      liveSessions,
      responses,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getHealthScore = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);
    const responses = await Response.find({ formId: form._id });
    const totalViews = form.viewCount || 0;
    const completionRate = totalViews > 0 ? Math.round((responses.length / totalViews) * 100) : 0;
    const avgTime = responses.length ? Math.round(responses.reduce((s, r) => s + r.completionTime, 0) / responses.length) : 0;
    const dropOff = form.fields.map((field, idx) => {
      const reached = responses.filter((r) => r.answers.some((a) => a.fieldId === field.id && a.value)).length;
      return { label: field.label || `Field ${idx + 1}`, percentage: responses.length ? Math.round((reached / responses.length) * 100) : 0 };
    });
    const health = calculateHealthScore({ fields: form.fields, completionRate, avgTime, dropOff, responses });
    return success(res, health);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return fail(res, 'Comment text is required');
    const comment = await Comment.create({ responseId: req.params.responseId, userId: req.user._id, text: text.trim() });
    return success(res, comment, 'Comment added', 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ responseId: req.params.responseId }).populate('userId', 'name').sort({ createdAt: -1 });
    return success(res, comments);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
