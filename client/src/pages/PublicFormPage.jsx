import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ClassicForm from '../components/public/ClassicForm';
import ConversationalForm from '../components/public/ConversationalForm';
import ThankYouPage from './ThankYouPage';
import FollowUpPage from './FollowUpPage';
import { PageSkeleton } from '../components/ui/Skeleton';
import { useHeatmap } from '../hooks/useHeatmap';
import { useJourney } from '../hooks/useJourney';
import { useFormSession } from '../hooks/useSocket';
import { getSocket } from '../lib/socket';

export default function PublicFormPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(null);
  const sessionId = `sess_${Date.now()}`;
  const heatmap = useHeatmap(form?._id, sessionId);
  const journey = useJourney();
  useFormSession(form?._id);

  useEffect(() => {
    api.get(`/f/${slug}`).then((res) => {
      setForm(res.data);
      if (res.data.settings?.quizMode && res.data.settings?.timeLimit) setTimeLeft(res.data.settings.timeLimit);
    }).catch((err) => setFetchError(err.message)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((l) => { if (l <= 1) { handleSubmit({ preventDefault: () => {} }); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const setAnswer = (fieldId, value) => {
    setAnswers((prev) => [...prev.filter((a) => a.fieldId !== fieldId), { fieldId, value }]);
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const socket = getSocket();
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      const res = await api.post(`/f/${slug}/submit`, {
        answers,
        completionTime,
        journeyLog: journey.getLog(),
        metadata: {
          source: params.get('source') || window.location.href,
          referrer: params.get('referrer') || document.referrer,
          device: navigator.userAgent?.slice(0, 100),
        },
      });
      socket.emit('leave-form', { formId: form._id, sessionId });
      setResult(res.data);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (fetchError) return <div className="min-h-screen flex items-center justify-center text-text-secondary">{fetchError}</div>;
  if (result?.followUpQuestions?.length && !result.followUpDone) {
    return <FollowUpPage slug={slug} questions={result.followUpQuestions} responseId={result.id} onDone={() => setResult({ ...result, followUpDone: true })} />;
  }
  if (result) return <ThankYouPage message={result.thankYouMessage} redirectUrl={result.redirectUrl} quizScore={result.quizMode ? { score: result.score, total: result.scoreTotal } : null} answers={result.answers} fields={form.fields} />;

  const fieldHandlers = {
    onFocus: (id) => { heatmap.onFocus(id); journey.onFocus(id); },
    onBlur: (id, val) => { heatmap.onBlur(id, val); journey.onBlur(id, val); setAnswer(id, val); },
  };

  if (form.settings?.conversationalMode) {
    return <ConversationalForm form={form} answers={answers} setAnswer={setAnswer} errors={errors} onSubmit={handleSubmit} submitting={submitting} fieldHandlers={fieldHandlers} timeLeft={timeLeft} />;
  }

  return (
    <div className="min-h-screen bg-base py-12 px-4">
      {timeLeft !== null && (
        <div className="fixed top-4 right-4 text-sm font-mono text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-lg">{timeLeft}s</div>
      )}
      <div className="max-w-[640px] mx-auto">
        <h1 className="text-2xl font-semibold text-text mb-2">{form.title}</h1>
        {form.description && <p className="text-text-secondary text-sm mb-8">{form.description}</p>}
        <ClassicForm form={form} answers={answers} setAnswer={setAnswer} errors={errors} onSubmit={handleSubmit} submitting={submitting} fieldHandlers={fieldHandlers} />
      </div>
    </div>
  );
}
