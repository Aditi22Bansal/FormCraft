import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FieldRenderer from '../public/FieldRenderer';
import { getVisibleFields } from '../../utils/fieldLogic';

export default function PreviewPanel({ open, onClose, title, fields, primaryColor }) {
  const [answers, setAnswers] = useState([]);
  const visible = getVisibleFields(fields, answers);

  const setAnswer = (fieldId, value) => {
    setAnswers((prev) => [...prev.filter((a) => a.fieldId !== fieldId), { fieldId, value }]);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg border-l border-border z-50 overflow-y-auto">
            <div className="sticky top-0 bg-bg border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-text">Preview</h3>
              <button onClick={onClose} className="p-1 text-text-secondary hover:text-text"><X size={18} /></button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-6">{title || 'Untitled Form'}</h2>
              <div className="space-y-5">
                {visible.map((field) => {
                  const ans = answers.find((a) => a.fieldId === field.id);
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-text mb-1.5">
                        {field.label || 'Untitled'}{field.required && <span className="text-error ml-1">*</span>}
                      </label>
                      {field.helperText && <p className="text-xs text-text-secondary mb-2">{field.helperText}</p>}
                      <FieldRenderer field={field} value={ans?.value} onChange={(v) => setAnswer(field.id, v)} primaryColor={primaryColor} />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
