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
  const accent = form.settings?.theme?.primaryColor || '#6366F1';

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
    const handler = (e) => { 
      if (e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        handleNext(); 
      } 
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext]);

  if (!field) return <div className="text-center text-text-secondary py-20">No questions to display</div>;
  const ans = answers.find((a) => a.fieldId === field.id);

  return (
    <div className="min-h-screen flex flex-col bg-base relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-surface">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}
          className="p-2 text-text-secondary hover:text-text disabled:opacity-30 cursor-pointer"><ArrowLeft size={20} /></button>
        <span className="text-xs font-bold text-text-secondary bg-elevated px-2.5 py-1 rounded-full border border-border">
          {index + 1} / {visible.length} Questions
        </span>
        {timeLeft != null ? (
          <span className="text-xs font-mono font-bold text-warning bg-warning/8 border border-warning/15 px-3 py-1 rounded-lg">
            ⏱️ {timeLeft}s left
          </span>
        ) : (
          <div className="w-8" />
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6366F103_0%,transparent_65%)] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={field.id} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }} 
            className="w-full max-w-lg text-center space-y-6 bg-surface border border-border rounded-2xl p-8 shadow-xl relative z-10"
          >
            {errors.length > 0 && (
              <div className="p-3 bg-danger/10 border border-danger/15 rounded-xl text-xs text-danger font-medium">
                ⚠️ {errors[0]}
              </div>
            )}
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text tracking-tight">
                {field.label || <span className="text-text-tertiary italic">Untitled Question</span>}
                {field.required && <span className="text-danger ml-1">*</span>}
              </h2>
              {field.helperText && <p className="text-xs text-text-secondary leading-relaxed">{field.helperText}</p>}
            </div>
            
            <div className="py-2" onFocus={() => fieldHandlers?.onFocus(field.id)}>
              <FieldRenderer 
                field={field} 
                value={ans?.value}
                onChange={(v) => { setAnswer(field.id, v); fieldHandlers?.onBlur(field.id, v); }}
                onFocus={() => fieldHandlers?.onFocus(field.id)} 
                primaryColor={accent} 
              />
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">Press Enter to progress</p>
              <Button 
                onClick={handleNext} 
                disabled={submitting} 
                className="w-full text-white font-semibold shadow-md transition-all duration-150"
                style={{ 
                  backgroundColor: accent, 
                  boxShadow: `0 4px 12px -2px ${accent}25`
                }}
              >
                {isLast ? (submitting ? 'Submitting…' : 'Submit Form') : 'Continue'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
