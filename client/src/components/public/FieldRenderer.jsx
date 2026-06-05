export default function FieldRenderer({ field, value, onChange, onFocus, error, primaryColor = '#7C6FCD' }) {
  const base = `w-full px-3 py-2.5 bg-elevated border rounded-lg text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-150 ${error ? 'border-danger' : 'border-border'}`;
  const style = { '--tw-ring-color': `${primaryColor}40` };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <input type={field.type} placeholder={field.placeholder} required={field.required}
          maxLength={field.characterLimit || undefined} className={base} style={style}
          value={value ?? ''} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} />
      );
    case 'textarea':
      return (
        <textarea rows={3} placeholder={field.placeholder} required={field.required}
          maxLength={field.characterLimit || undefined} className={`${base} resize-none`} style={style}
          value={value ?? ''} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} />
      );
    case 'date':
      return <input type="date" required={field.required} className={base} style={style} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'dropdown':
      return (
        <select required={field.required} className={`${base} cursor-pointer`} style={style} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.placeholder || 'Select…'}</option>
          {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name={field.id} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="accent-primary" />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => {
            const checked = Array.isArray(value) ? value.includes(opt) : false;
            return (
              <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => {
                  const prev = Array.isArray(value) ? value : [];
                  onChange(e.target.checked ? [...prev, opt] : prev.filter((v) => v !== opt));
                }} className="accent-primary" />
                {opt}
              </label>
            );
          })}
        </div>
      );
    case 'rating':
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onChange(star)}
              className={`text-2xl transition-colors duration-150 ${(value || 0) >= star ? 'text-warning' : 'text-border'}`}>
              ★
            </button>
          ))}
        </div>
      );
    case 'file':
      return <input type="file" className={base} onChange={(e) => onChange(e.target.files?.[0]?.name || '')} />;
    case 'signature':
      return (
        <div className="border border-dashed border-border rounded-lg h-24 flex items-center justify-center text-sm text-text-secondary">
          Signature pad (type your name below)
          <input type="text" placeholder="Type signature" className="ml-2 border-b border-border outline-none text-sm" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    default:
      return null;
  }
}
