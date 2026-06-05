import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import api from '../lib/api';

export default function FollowUpPage({ slug, questions, responseId, onDone }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/f/${slug}/followup`, { responseId, followUpAnswers: questions.map((q, i) => ({ ...q, value: answers[i] })) });
    } catch { /* optional */ }
    finally { setSubmitting(false); onDone(); }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full space-y-4">
        <h2 className="text-xl font-semibold text-text">A few more questions…</h2>
        {questions.map((q, i) => (
          <div key={i} className="bg-surface border border-border rounded-[10px] p-5">
            <label className="text-sm font-medium text-text mb-2 block">{q.question}</label>
            {q.type === 'radio' ? (
              <div className="space-y-2">{(q.options || []).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="radio" name={`q${i}`} onChange={() => setAnswers({ ...answers, [i]: opt })} className="accent-accent" />{opt}
                </label>
              ))}</div>
            ) : (
              <input type="text" value={answers[i] || ''} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm text-text" />
            )}
          </div>
        ))}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">{submitting ? 'Saving…' : 'Submit'}</Button>
      </motion.div>
    </div>
  );
}
