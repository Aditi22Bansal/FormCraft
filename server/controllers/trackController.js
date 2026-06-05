const FormSession = require('../models/FormSession');
const Form = require('../models/Form');
const { success, fail } = require('../utils/apiResponse');

exports.trackEvents = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return fail(res, 'Form not found', 404);

    const { sessionId, events } = req.body;
    if (!sessionId || !Array.isArray(events)) return fail(res, 'Invalid tracking data');

    await FormSession.findOneAndUpdate(
      { formId: form._id, sessionId },
      { $push: { events: { $each: events } } },
      { upsert: true, new: true }
    );

    return success(res, null, 'Events tracked');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getHeatmapData = async (req, res) => {
  try {
    const sessions = await FormSession.find({ formId: req.params.formId });
    const fieldStats = {};

    sessions.forEach((session) => {
      session.events.forEach((event) => {
        if (!event.fieldId) return;
        if (!fieldStats[event.fieldId]) {
          fieldStats[event.fieldId] = { clicks: 0, focuses: 0, abandons: 0, totalTime: 0 };
        }
        const s = fieldStats[event.fieldId];
        if (event.type === 'click') s.clicks++;
        if (event.type === 'focus') s.focuses++;
        if (event.type === 'abandon') s.abandons++;
        if (event.type === 'blur' && event.timeSpent) s.totalTime += event.timeSpent;
      });
    });

    const heatmap = Object.entries(fieldStats).map(([fieldId, stats]) => ({
      fieldId,
      intensity: stats.clicks + stats.focuses + stats.abandons * 2,
      ...stats,
    }));

    return success(res, heatmap);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
