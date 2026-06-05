import { useState } from 'react';
import FieldRenderer from './FieldRenderer';
import { getVisibleFields } from '../../utils/fieldLogic';
import Button from '../ui/Button';

export default function ClassicForm({ form, answers, setAnswer, errors, onSubmit, submitting, fieldHandlers, currentStep = 0 }) {
  const visible = getVisibleFields(form.fields, answers);
  const steps = form.steps?.length > 0 ? form.steps : null;
  const stepFields = steps ? visible.filter((f) => steps[currentStep]?.fieldIds?.includes(f.id)) : visible;
  const accent = form.settings?.theme?.primaryColor || '#6366F1';
  const progress = steps ? ((currentStep + 1) / steps.length) * 100 : 100;

  // Local state to track currently focused field card for visual highlighting
  const [focusedId, setFocusedId] = useState(null);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {steps && (
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden mb-5">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: accent }} />
        </div>
      )}
      {errors.length > 0 && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-medium space-y-1">
          {errors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
        </div>
      )}
      <div className="space-y-4">
        {stepFields.map((field) => {
          const ans = answers.find((a) => a.fieldId === field.id);
          const isFocused = focusedId === field.id;
          return (
            <div 
              key={field.id} 
              onFocus={() => { setFocusedId(field.id); fieldHandlers?.onFocus(field.id); }} 
              onBlur={() => { setFocusedId(null); fieldHandlers?.onBlur(field.id, ans?.value); }}
              className={`bg-surface border rounded-xl p-6 transition-all duration-200 relative ${
                isFocused 
                  ? 'shadow-md ring-1' 
                  : 'border-border'
              }`}
              style={{ 
                borderColor: isFocused ? accent : '',
                boxShadow: isFocused ? `0 4px 12px -2px ${accent}0d` : '',
                ringColor: isFocused ? `${accent}15` : ''
              }}
            >
              {/* Vertical focus indicator bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity duration-150" 
                style={{ backgroundColor: accent, opacity: isFocused ? 1 : 0 }}
              />

              <label className="block text-[15px] font-bold text-text mb-1.5 flex items-center gap-1">
                {field.label || <span className="text-text-tertiary italic">Untitled Field</span>}
                {field.required && <span className="text-danger">*</span>}
              </label>
              
              {field.helperText && <p className="text-sm text-text-secondary mb-3">{field.helperText}</p>}
              
              <div className="mt-1">
                <FieldRenderer 
                  field={field} 
                  value={ans?.value}
                  onChange={(v) => { setAnswer(field.id, v); fieldHandlers?.onBlur(field.id, v); }}
                  onFocus={() => { setFocusedId(field.id); fieldHandlers?.onFocus(field.id); }} 
                  primaryColor={accent} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={submitting || stepFields.length === 0} 
          className="w-full text-white font-semibold transition-all duration-150"
          style={{ backgroundColor: accent }}
        >
          {submitting ? 'Submitting…' : 'Submit Response'}
        </Button>
      </div>
    </form>
  );
}
