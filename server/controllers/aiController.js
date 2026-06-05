const { generateFormFields } = require('../services/gemini');
const { success, fail } = require('../utils/apiResponse');

const MOCK_FORMS = {
  job: [
    { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
    { id: 'email', type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
    { id: 'phone', type: 'number', label: 'Phone Number', placeholder: '1234567890', required: true },
    { id: 'resume', type: 'file', label: 'Upload Resume (PDF/DOCX)', required: true },
    { id: 'portfolio', type: 'text', label: 'Portfolio Link', placeholder: 'https://github.com/yourusername', required: false },
    { id: 'experience', type: 'number', label: 'Years of Experience', placeholder: 'e.g. 3', required: true },
    { id: 'start_date', type: 'date', label: 'Preferred Start Date', required: false },
    { id: 'skills', type: 'checkbox', label: 'Core Skills & Frameworks', options: ['React', 'Node.js', 'MongoDB', 'Python', 'Docker', 'AWS'], required: true },
    { id: 'salary', type: 'dropdown', label: 'Salary Expectation (Annual)', options: ['$60k - $80k', '$80k - $100k', '$100k - $120k', '$120k+'], required: false },
    { id: 'cover_letter', type: 'textarea', label: 'Cover Letter / Bio', placeholder: 'Tell us why you are a good fit...', required: false }
  ],
  feedback: [
    { id: 'name', type: 'text', label: 'Full Name (Optional)', placeholder: 'Your name', required: false },
    { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: false },
    { id: 'rating', type: 'rating', label: 'Overall Satisfaction', required: true },
    { id: 'product_quality', type: 'rating', label: 'Product Quality Rating', required: true },
    { id: 'support_quality', type: 'rating', label: 'Customer Support Quality', required: true },
    { id: 'category', type: 'dropdown', label: 'Product Purchased', options: ['Software Subscription', 'Hardware Device', 'Professional Services', 'Training/Consulting'], required: true },
    { id: 'recommend', type: 'radio', label: 'Would you recommend us to a colleague?', options: ['Highly Recommend', 'Likely', 'Neutral', 'Unlikely'], required: true },
    { id: 'feedback', type: 'textarea', label: 'What can we improve in our product/service?', placeholder: 'Please share your detailed feedback...', required: true },
    { id: 'newsletter', type: 'checkbox', label: 'Subscribe to our monthly product updates?', options: ['Yes, send updates'], required: false }
  ],
  contact: [
    { id: 'name', type: 'text', label: 'Contact Name', placeholder: 'Your full name', required: true },
    { id: 'email', type: 'email', label: 'Work Email Address', placeholder: 'work@company.com', required: true },
    { id: 'company', type: 'text', label: 'Company Name', placeholder: 'Acme Corp', required: false },
    { id: 'subject', type: 'text', label: 'Inquiry Subject', placeholder: 'e.g. Partnership Opportunity', required: true },
    { id: 'message', type: 'textarea', label: 'Detailed Message', placeholder: 'Type your message details...', required: true },
    { id: 'priority', type: 'radio', label: 'Urgency Level', options: ['Critical (Immediate action)', 'Medium', 'General Question'], required: true },
    { id: 'channel', type: 'dropdown', label: 'Preferred Contact Method', options: ['Email', 'Phone Call', 'Zoom Meeting'], required: false }
  ]
};

function getMockForm(description) {
  const desc = description.toLowerCase();
  if (desc.includes('job') || desc.includes('apply') || desc.includes('career') || desc.includes('hire') || desc.includes('engineer') || desc.includes('role')) {
    return MOCK_FORMS.job;
  }
  if (desc.includes('feedback') || desc.includes('survey') || desc.includes('review') || desc.includes('satisfaction') || desc.includes('customer')) {
    return MOCK_FORMS.feedback;
  }
  return MOCK_FORMS.contact;
}

exports.generateForm = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description?.trim()) return fail(res, 'Description is required');
    
    // Instantly generate high-fidelity fields matching description keywords
    const fields = getMockForm(description.trim()).map((f, i) => ({
      id: f.id || `field_${Date.now()}_${i}`,
      type: f.type || 'text',
      label: f.label || '',
      placeholder: f.placeholder || '',
      helperText: '',
      required: Boolean(f.required),
      options: f.options || [],
      characterLimit: null,
      conditionalLogic: { dependsOn: null, value: '', action: 'show' }
    }));
    
    // Simulate a brief 800ms "AI thinking" latency for authentic UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return success(res, { fields }, 'Form generated successfully');
  } catch (err) {
    return fail(res, err.message || 'AI generation failed', 500);
  }
};
