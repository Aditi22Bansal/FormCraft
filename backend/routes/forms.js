const express = require('express');
const Form = require('../models/Form');
const Response = require('../models/Response');
const { protect } = require('../middleware/auth');
const { generateUniqueSlug } = require('../utils/slug');

const router = express.Router();

const canAccessForm = (form, user) => {
  return user.role === 'admin' || form.createdBy.toString() === user._id.toString();
};

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const forms = await Form.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        const submissionCount = await Response.countDocuments({ formId: form._id });
        return {
          ...form.toObject(),
          submissionCount,
        };
      })
    );

    res.json(formsWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, fields } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const slug = await generateUniqueSlug(title);

    const form = await Form.create({
      title: title.trim(),
      fields: fields || [],
      slug,
      createdBy: req.user._id,
    });

    res.status(201).json(form);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug }).select(
      'title fields slug version createdAt'
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json(form);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/public/:slug/submit', async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    const visibleFields = getVisibleFields(form.fields, answers);
    const errors = validateAnswers(visibleFields, answers);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const response = await Response.create({
      formId: form._id,
      formVersion: form.version,
      answers,
    });

    res.status(201).json({ message: 'Response submitted', id: response._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate('createdBy', 'name email');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!canAccessForm(form, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissionCount = await Response.countDocuments({ formId: form._id });

    res.json({ ...form.toObject(), submissionCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!canAccessForm(form, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, fields } = req.body;

    form.versionHistory.push({
      version: form.version,
      title: form.title,
      fields: form.fields,
      savedAt: new Date(),
    });

    if (title?.trim()) form.title = title.trim();
    if (fields) form.fields = fields;
    form.version += 1;

    await form.save();
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!canAccessForm(form, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Response.deleteMany({ formId: form._id });
    await Form.findByIdAndDelete(req.params.id);

    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id/responses', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!canAccessForm(form, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const responses = await Response.find({ formId: form._id }).sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id/responses/trends', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!canAccessForm(form, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const trends = await Response.aggregate([
      { $match: { formId: form._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id/responses/export', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!canAccessForm(form, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const responses = await Response.find({ formId: form._id }).sort({ submittedAt: -1 });

    const headers = ['Submitted At', ...form.fields.map((f) => f.label || f.id)];
    const rows = responses.map((r) => {
      const row = [new Date(r.submittedAt).toISOString()];
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
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

function escapeCsv(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getAnswerValue(answers, fieldId) {
  const answer = answers.find((a) => a.fieldId === fieldId);
  return answer?.value ?? '';
}

function evaluateCondition(field, answers) {
  if (!field.conditional?.fieldId) return true;

  const targetValue = getAnswerValue(answers, field.conditional.fieldId);
  const condValue = field.conditional.value ?? '';
  const strTarget = Array.isArray(targetValue) ? targetValue.join(',') : String(targetValue);

  switch (field.conditional.operator) {
    case 'equals':
      return strTarget === condValue;
    case 'not_equals':
      return strTarget !== condValue;
    case 'contains':
      return strTarget.includes(condValue);
    default:
      return true;
  }
}

function getVisibleFields(fields, answers) {
  return fields.filter((f) => evaluateCondition(f, answers));
}

function validateAnswers(fields, answers) {
  const errors = [];

  for (const field of fields) {
    if (!field.required) continue;

    const answer = answers.find((a) => a.fieldId === field.id);
    const value = answer?.value;

    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors.push(`${field.label || field.id} is required`);
    }
  }

  return errors;
}

module.exports = router;
