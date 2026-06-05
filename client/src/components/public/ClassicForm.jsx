import FieldRenderer from './FieldRenderer';
import { getVisibleFields } from '../../utils/fieldLogic';
import Button from '../ui/Button';

export default function ClassicForm({ form, answers, setAnswer, errors, onSubmit, submitting, fieldHandlers, currentStep = 0 }) {
  const visible = getVisibleFields(form.fields, answers);
  const steps = form.steps?.length > 0 ? form.steps : null;
  const stepFields = steps ? visible.filter((f) => steps[currentStep]?.fieldIds?.includes(f.id)) : visible;
  const accent = form.settings?.theme?.primaryColor || '#7C6FCD';
  const progress = steps ? ((currentStep + 1) / steps.length) * 100 : 100;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {steps && (
        <div className="h-1 bg-elevated rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: accent }} />
        </div>
      )}
      {errors.length > 0 && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-[10px] text-sm text-danger">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
      {stepFields.map((field) => {
        const ans = answers.find((a) => a.fieldId === field.id);
        return (
          <div key={field.id} className="bg-surface border border-border rounded-[10px] p-5"
            onFocus={() => fieldHandlers?.onFocus(field.id)} onBlur={() => fieldHandlers?.onBlur(field.id, ans?.value)}>
            <label className="block text-sm font-medium text-text mb-1">
              {field.label || 'Untitled'}{field.required && <span className="text-danger ml-1">*</span>}
            </label>
            {field.helperText && <p className="text-xs text-text-secondary mb-3">{field.helperText}</p>}
            <FieldRenderer field={field} value={ans?.value}
              onChange={(v) => { setAnswer(field.id, v); fieldHandlers?.onBlur(field.id, v); }}
              onFocus={() => fieldHandlers?.onFocus(field.id)} primaryColor={accent} />
          </div>
        );
      })}
      <Button type="submit" disabled={submitting || stepFields.length === 0} className="w-full">
        {submitting ? 'Submitting…' : 'Submit'}
      </Button>
    </form>
  );
}
