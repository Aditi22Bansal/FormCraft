import { useFieldSuggestion } from '../../hooks/useFieldSuggestion';

export default function FieldSettings({ field, allFields, onUpdate, quizMode }) {
  if (!field) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-secondary">
        Select a field to edit its properties
      </div>
    );
  }

  const suggestion = useFieldSuggestion(field.label, field.type);
  const others = allFields.filter((f) => f.id !== field.id);
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(field.type);
  const logic = field.conditionalLogic || { dependsOn: null, value: '', action: 'show' };

  return (
    <div className="space-y-4 overflow-y-auto">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Label</label>
        <input type="text" value={field.label} onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        {suggestion && (
          <button onClick={() => onUpdate({ type: suggestion })}
            className="mt-1.5 text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full hover:bg-primary/10 transition-colors duration-150">
            Suggested type: {suggestion} ✓ Apply
          </button>
        )}
      </div>

      {!['checkbox', 'radio', 'rating'].includes(field.type) && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Placeholder</label>
          <input type="text" value={field.placeholder} onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Helper text</label>
        <input type="text" value={field.helperText || ''} onChange={(e) => onUpdate({ helperText: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {['text', 'textarea'].includes(field.type) && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Character limit</label>
          <input type="number" value={field.characterLimit || ''} onChange={(e) => onUpdate({ characterLimit: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="No limit" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-text">Required</span>
        <button onClick={() => onUpdate({ required: !field.required })}
          className={`relative w-9 h-5 rounded-full transition-colors duration-150 ${field.required ? 'bg-primary' : 'bg-border'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150 ${field.required ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      {hasOptions && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Options</label>
          <div className="space-y-2">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={opt} onChange={(e) => {
                  const opts = [...field.options]; opts[i] = e.target.value; onUpdate({ options: opts });
                }} className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm" />
                <button onClick={() => onUpdate({ options: field.options.filter((_, j) => j !== i) })} className="text-text-secondary hover:text-error text-sm">×</button>
              </div>
            ))}
            <button onClick={() => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
              className="text-xs text-primary">+ Add option</button>
          </div>
        </div>
      )}

      {quizMode && (
        <div className="border-t border-border pt-4">
          <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Correct Answer</label>
          {['dropdown', 'radio', 'checkbox'].includes(field.type) ? (
            <select value={field.correctAnswer || ''} onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="">Select correct option…</option>
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input type="text" value={field.correctAnswer || ''} onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Type correct value…" />
          )}
        </div>
      )}

      {others.length > 0 && (
        <div className="border-t border-border pt-4">
          <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Conditional logic</label>
          <div className="space-y-2 text-sm">
            <select value={logic.dependsOn || ''} onChange={(e) => onUpdate({ conditionalLogic: { ...logic, dependsOn: e.target.value || null } })}
              className="w-full px-2 py-1.5 border border-border rounded-lg text-sm">
              <option value="">Always show</option>
              {others.map((f) => <option key={f.id} value={f.id}>{f.label || f.type}</option>)}
            </select>
            {logic.dependsOn && (
              <>
                <select value={logic.action} onChange={(e) => onUpdate({ conditionalLogic: { ...logic, action: e.target.value } })}
                  className="w-full px-2 py-1.5 border border-border rounded-lg text-sm">
                  <option value="show">Show if</option>
                  <option value="hide">Hide if</option>
                </select>
                <input type="text" value={logic.value} onChange={(e) => onUpdate({ conditionalLogic: { ...logic, value: e.target.value } })}
                  placeholder="equals value" className="w-full px-2 py-1.5 border border-border rounded-lg text-sm" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
