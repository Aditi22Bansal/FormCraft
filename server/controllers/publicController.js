const Form = require('../models/Form');
const Response = require('../models/Response');
const { getVisibleFields, validateAnswers } = require('../utils/fieldLogic');
const { analyzeAnswers } = require('../services/sentiment');
const { detectAnomalies } = require('../services/anomaly');
const { generateFollowUp } = require('../services/gemini');
const { success, fail } = require('../utils/apiResponse');

function scoreQuiz(form, answers) {
  if (!form.settings?.quizMode) return { score: null, scoreTotal: null, gradedAnswers: answers };
  let correct = 0;
  let total = 0;
  const graded = answers.map((a) => {
    const field = form.fields.find((f) => f.id === a.fieldId);
    if (!field?.correctAnswer) return { ...a, isCorrect: null };
    total++;
    const val = String(a.value ?? '').trim().toLowerCase();
    const expected = String(field.correctAnswer).trim().toLowerCase();
    const isCorrect = val === expected;
    if (isCorrect) correct++;
    return { ...a, isCorrect };
  });
  return { score: correct, scoreTotal: total, gradedAnswers: graded };
}

exports.getPublicForm = async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug }).select(
      '_id title description fields steps settings slug version status viewCount'
    );
    if (!form) return fail(res, 'Form not found', 404);
    if (form.status === 'closed') return fail(res, 'This form is closed', 403);
    if (form.settings?.closeDate && new Date() > new Date(form.settings.closeDate)) {
      return fail(res, 'This form has expired', 403);
    }
    await Form.findByIdAndUpdate(form._id, { $inc: { viewCount: 1 } });
    const publicForm = form.toObject();
    if (form.settings?.quizMode) {
      publicForm.fields = publicForm.fields.map((f) => {
        const { correctAnswer, ...rest } = f;
        return rest;
      });
    }
    return success(res, publicForm);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.submitResponse = async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug });
    if (!form) return fail(res, 'Form not found', 404);
    if (form.status === 'closed') return fail(res, 'This form is closed', 403);

    const { answers, completionTime, journeyLog, metadata } = req.body;
    if (!Array.isArray(answers)) return fail(res, 'Answers must be an array');

    if (form.settings?.maxResponses) {
      const count = await Response.countDocuments({ formId: form._id });
      if (count >= form.settings.maxResponses) return fail(res, 'Maximum responses reached', 403);
    }

    const visibleFields = getVisibleFields(form.fields, answers);
    const errors = validateAnswers(visibleFields, answers);
    if (errors.length > 0) return fail(res, 'Validation failed', 400);

    const anomaly = await detectAnomalies({
      formId: form._id,
      answers,
      completionTime: completionTime || 0,
      ip: req.ip,
      fields: form.fields,
    });

    let processed = analyzeAnswers(form.fields, anomaly.answerFlags);
    const quiz = scoreQuiz(form, processed);
    processed = quiz.gradedAnswers;

    const response = await Response.create({
      formId: form._id,
      formVersion: form.version,
      answers: processed,
      completionTime: completionTime || 0,
      journeyLog: journeyLog || [],
      ipHash: anomaly.ipHash,
      device: metadata?.device || req.headers['user-agent']?.slice(0, 100),
      source: metadata?.source || null,
      referrer: metadata?.referrer || null,
      anomalySummary: anomaly.anomalySummary,
      score: quiz.score,
      scoreTotal: quiz.scoreTotal,
    });

    let followUpQuestions = [];
    try {
      followUpQuestions = await generateFollowUp(processed, form.fields);
    } catch { /* optional */ }

    return success(res, {
      id: response._id,
      thankYouMessage: form.settings?.thankYouMessage,
      redirectUrl: form.settings?.redirectUrl,
      followUpQuestions,
      quizMode: form.settings?.quizMode,
      score: quiz.score,
      scoreTotal: quiz.scoreTotal,
      answers: processed,
    }, 'Response submitted', 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.submitFollowUp = async (req, res) => {
  try {
    const { responseId, followUpAnswers } = req.body;
    const response = await Response.findById(responseId);
    if (!response) return fail(res, 'Response not found', 404);
    response.followUpAnswers = followUpAnswers || [];
    await response.save();
    return success(res, response, 'Follow-up saved');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
