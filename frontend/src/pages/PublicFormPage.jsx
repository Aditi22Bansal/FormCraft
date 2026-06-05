import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Spinner from '../components/Spinner';
import FieldRenderer from '../components/FieldRenderer';
import api from '../utils/api';

function evaluateCondition(field, answers) {
  if (!field.conditional?.fieldId) return true;
  const answer = answers.find((a) => a.fieldId === field.conditional.fieldId);
  const target = Array.isArray(answer?.value) ? answer.value.join(',') : String(answer?.value ?? '');
  switch (field.conditional.operator) {
    case 'equals': return target === field.conditional.value;
    case 'not_equals': return target !== field.conditional.value;
    case 'contains': return target.includes(field.conditional.value);
    default: return true;
  }
}

export default function PublicFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    api
      .get(`/forms/public/${slug}`)
      .then((res) => setForm(res.data))
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const setAnswer = (fieldId, value) => {
    setAnswers((prev) => {
      const next = prev.filter((a) => a.fieldId !== fieldId);
      return [...next, { fieldId, value }];
    });
    setErrors((prev) => prev.filter((e) => !e.includes(fieldId)));
  };

  const visibleFields = form?.fields.filter((f) => evaluateCondition(f, answers)) ?? [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errs = visibleFields
      .filter((f) => {
        if (!f.required) return false;
        const ans = answers.find((a) => a.fieldId === f.id);
        const val = ans?.value;
        return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
      })
      .map((f) => `${f.label || f.id} is required`);

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/forms/public/${slug}/submit`, { answers });
      setSubmitted(true);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner full />;

  if (fetchError || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form not found</h1>
          <p className="text-gray-500">{fetchError || 'This form may have been deleted.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 size={56} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanks for your response!</h1>
          <p className="text-gray-500">Your submission has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center p-4 py-12">
        <div className="w-full max-w-xl">
          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{visibleFields.length} question{visibleFields.length !== 1 ? 's' : ''}</p>
          </div>

          {errors.length > 0 && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {visibleFields.map((field) => {
              const ans = answers.find((a) => a.fieldId === field.id);
              return (
                <div key={field.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    {field.label || <em className="text-gray-400">Untitled field</em>}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <FieldRenderer
                    field={field}
                    value={ans?.value}
                    onChange={(val) => setAnswer(field.id, val)}
                  />
                </div>
              );
            })}

            {visibleFields.length === 0 && (
              <div className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                This form has no visible fields.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || visibleFields.length === 0}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-8">
            Powered by <span className="font-medium">FormCraft</span>
          </p>
        </div>
      </div>
    </div>
  );
}
