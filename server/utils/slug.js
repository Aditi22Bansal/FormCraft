const slugify = require('slugify');
const Form = require('../models/Form');

async function generateUniqueSlug(title) {
  let base = slugify(title, { lower: true, strict: true }) || 'form';
  let slug = base;
  let counter = 1;
  while (await Form.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

module.exports = { generateUniqueSlug };
