const { generateFormFields } = require('../services/gemini');
const { success, fail } = require('../utils/apiResponse');

exports.generateForm = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description?.trim()) return fail(res, 'Description is required');
    const fields = await generateFormFields(description.trim());
    return success(res, { fields }, 'Form generated successfully');
  } catch (err) {
    const status = err.message?.includes('quota') || err.message?.includes('429') ? 429 : 500;
    return fail(res, err.message || 'AI generation failed', status);
  }
};
