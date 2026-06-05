import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ThankYouPage({ message = 'Thank you for your submission!', redirectUrl, quizScore, answers = [], fields = [] }) {
  const [countdown, setCountdown] = useState(redirectUrl ? 5 : null);

  useEffect(() => {
    if (!redirectUrl || countdown === null) return;
    if (countdown <= 0) { window.location.href = redirectUrl; return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, redirectUrl]);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="text-center max-w-lg w-full bg-surface border border-border rounded-xl p-8">
        <svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 52 52">
          <circle className="check-circle" cx="26" cy="26" r="24" fill="none" stroke="#4ADE80" strokeWidth="3" />
          <path className="check-path" fill="none" stroke="#4ADE80" strokeWidth="3" d="M14 27l7 7 16-16" />
        </svg>
        <h1 className="text-xl font-semibold text-text mb-2">{message}</h1>
        {quizScore && (
          <div className="mb-6">
            <p className="text-accent text-2xl font-bold mb-4">Score: {quizScore.score} / {quizScore.total}</p>
            <div className="text-left border border-border rounded-lg overflow-hidden divide-y divide-border">
              {fields.map((field) => {
                const ans = answers.find((a) => a.fieldId === field.id);
                if (!ans || ans.isCorrect === null) return null;
                return (
                  <div key={field.id} className="p-4 bg-base/50">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium text-text">{field.label || field.type}</p>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${ans.isCorrect ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                        {ans.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Your answer: <span className="font-medium text-text">{Array.isArray(ans.value) ? ans.value.join(', ') : ans.value || '—'}</span></p>
                    {!ans.isCorrect && field.correctAnswer && (
                      <p className="text-xs text-success mt-0.5 font-medium">Correct answer: {field.correctAnswer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="text-text-secondary text-sm">Your response has been recorded.</p>
        {redirectUrl && countdown !== null && <p className="text-xs text-text-tertiary mt-4">Redirecting in {countdown}s…</p>}
        <Link to="/" className="inline-block mt-6 text-sm text-accent hover:underline">Submit another response</Link>
      </div>
    </div>
  );
}
