import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import FieldRenderer from './FieldRenderer';
import { getVisibleFields } from '../../utils/fieldLogic';
import Button from '../ui/Button';
import { getSocket } from '../../lib/socket';

export default function ConversationalForm({ form, answers, setAnswer, errors, onSubmit, submitting, fieldHandlers, timeLeft }) {
  const visible = getVisibleFields(form.fields, answers);
  const [index, setIndex] = useState(0);
  const field = visible[index];
  const isLast = index === visible.length - 1;

  useEffect(() => {
    const socket = getSocket();
    socket.emit('session-update', { formId: form._id, currentFieldIndex: index });
  }, [index, form._id]);

  const handleNext = useCallback(() => {
    if (field?.required) {
      const ans = answers.find((a) => a.fieldId === field.id);
      const val = ans?.value;
      if (!val || val === '' || (Array.isArray(val) && !val.length)) return;
    }
    if (isLast) onSubmit({ preventDefault: () => {} });
    else setIndex((i) => i + 1);
  }, [field, answers, isLast, onSubmit]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext]);

  if (!field) return <div className="text-center text-text-secondary py-20">No questions to display</div>;
  const ans = answers.find((a) => a.fieldId === field.id);

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}
          className="p-2 text-text-secondary hover:text-text disabled:opacity-30"><ArrowLeft size={20} /></button>
        <span className="text-sm text-text-tertiary">{index + 1} / {visible.length}</span>
        {timeLeft != null ? <span className="text-sm font-mono text-warning">{timeLeft}s</span> : <div className="w-8" />}
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div key={field.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }} className="w-full max-w-lg text-center">
            {errors.length > 0 && <div className="mb-4 p-3 bg-danger/10 rounded-[10px] text-sm text-danger">{errors[0]}</div>}
            <h2 className="text-[28px] font-medium text-text mb-6">{field.label || 'Untitled'}{field.required && ' *'}</h2>
            {field.helperText && <p className="text-text-secondary mb-6 -mt-4">{field.helperText}</p>}
            <div className="mb-6" onFocus={() => fieldHandlers?.onFocus(field.id)}>
              <FieldRenderer field={field} value={ans?.value}
                onChange={(v) => { setAnswer(field.id, v); fieldHandlers?.onBlur(field.id, v); }}
                onFocus={() => fieldHandlers?.onFocus(field.id)} primaryColor="#7C6FCD" />
            </div>
            <p className="text-xs text-text-tertiary mb-4">Press Enter to continue →</p>
            <Button onClick={handleNext} disabled={submitting}>{isLast ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}</Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
