const Form = require('../models/Form');
const Response = require('../models/Response');
const { generateUniqueSlug } = require('../utils/slug');
const { canAccessForm } = require('../middleware/auth');
const { success, fail } = require('../utils/apiResponse');

exports.listForms = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const forms = await Form.find(filter).sort({ updatedAt: -1 }).populate('createdBy', 'name email');

    const data = await Promise.all(
      forms.map(async (form) => {
        const submissionCount = await Response.countDocuments({ formId: form._id });
        return { ...form.toObject(), submissionCount };
      })
    );

    return success(res, data);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.createForm = async (req, res) => {
  try {
    const { title, description, fields, steps, settings } = req.body;
    if (!title?.trim()) return fail(res, 'Title is required');

    const slug = await generateUniqueSlug(title);
    const form = await Form.create({
      title: title.trim(),
      description: description || '',
      fields: fields || [],
      steps: steps || [],
      settings: settings || {},
      slug,
      createdBy: req.user._id,
    });

    return success(res, form, 'Form created', 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate('createdBy', 'name email');
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);

    const submissionCount = await Response.countDocuments({ formId: form._id });
    return success(res, { ...form.toObject(), submissionCount });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);

    const { title, description, fields, steps, settings, status } = req.body;

    form.versions.push({
      version: form.version,
      title: form.title,
      fields: form.fields,
      savedAt: new Date(),
    });

    if (title?.trim()) form.title = title.trim();
    if (description !== undefined) form.description = description;
    if (fields) form.fields = fields;
    if (steps) form.steps = steps;
    if (settings) form.settings = { ...form.settings.toObject?.() || form.settings, ...settings };
    if (status) form.status = status;
    form.version += 1;

    await form.save();
    return success(res, form, 'Form updated');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);

    await Response.deleteMany({ formId: form._id });
    await Form.findByIdAndDelete(req.params.id);
    return success(res, null, 'Form deleted');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.duplicateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);

    const slug = await generateUniqueSlug(`${form.title} copy`);
    const copy = await Form.create({
      title: `${form.title} (Copy)`,
      description: form.description,
      fields: form.fields,
      steps: form.steps,
      settings: form.settings,
      slug,
      createdBy: req.user._id,
      status: 'draft',
    });

    return success(res, copy, 'Form duplicated', 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getFormVersions = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);
    return success(res, form.versions || []);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.restoreFormVersion = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return fail(res, 'Form not found', 404);
    if (!canAccessForm(form, req.user)) return fail(res, 'Access denied', 403);

    const versionNum = parseInt(req.params.version, 10);
    const target = form.versions.find((v) => v.version === versionNum);
    if (!target) return fail(res, 'Version not found', 404);

    // Save current to versions before restoring
    form.versions.push({
      version: form.version,
      title: form.title,
      fields: form.fields,
      savedAt: new Date(),
    });

    form.title = target.title;
    form.fields = target.fields;
    form.version += 1;

    await form.save();
    return success(res, form, 'Version restored');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
