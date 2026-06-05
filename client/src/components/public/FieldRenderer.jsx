import React from 'react';

export default function FieldRenderer({ field, value, onChange, onFocus, error, primaryColor = '#6366F1' }) {
  // Use bg-surface (white) for inputs instead of bg-elevated for a cleaner, Vercel-style look
  const base = `w-full px-3 py-3 bg-surface border rounded-lg text-base text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-all duration-150 ${
    error ? 'border-danger focus:ring-danger/10 focus:border-danger' : 'border-border'
  }`;
  
  // Custom styles for dynamic focus ring and input accents matching the form theme
  const style = { 
    '--tw-ring-color': `${primaryColor}25`,
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = primaryColor;
    e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
    if (onFocus) onFocus();
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '';
    e.target.style.boxShadow = '';
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <input 
          type={field.type} 
          placeholder={field.placeholder || 'Type your answer…'} 
          required={field.required}
          maxLength={field.characterLimit || undefined} 
          className={base} 
          style={style}
          value={value ?? ''} 
          onChange={(e) => onChange(e.target.value)} 
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    case 'textarea':
      return (
        <textarea 
          rows={3} 
          placeholder={field.placeholder || 'Type details…'} 
          required={field.required}
          maxLength={field.characterLimit || undefined} 
          className={`${base} resize-none`} 
          style={style}
          value={value ?? ''} 
          onChange={(e) => onChange(e.target.value)} 
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    case 'date':
      return (
        <input 
          type="date" 
          required={field.required} 
          className={base} 
          style={style} 
          value={value ?? ''} 
          onChange={(e) => onChange(e.target.value)} 
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    case 'dropdown':
      return (
        <select 
          required={field.required} 
          className={`${base} cursor-pointer`} 
          style={style} 
          value={value ?? ''} 
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="">{field.placeholder || 'Choose option…'}</option>
          {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div className="space-y-2.5 pt-1 text-left">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-3 text-sm text-text-secondary hover:text-text cursor-pointer select-none">
              <input 
                type="radio" 
                name={field.id} 
                value={opt} 
                checked={value === opt} 
                onChange={() => onChange(opt)} 
                className="w-4 h-4 transition-all" 
                style={{ accentColor: primaryColor }}
              />
              <span className="font-medium">{opt}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-2.5 pt-1 text-left">
          {(field.options || []).map((opt, i) => {
            const checked = Array.isArray(value) ? value.includes(opt) : false;
            return (
              <label key={i} className="flex items-center gap-3 text-sm text-text-secondary hover:text-text cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={checked} 
                  onChange={(e) => {
                    const prev = Array.isArray(value) ? value : [];
                    onChange(e.target.checked ? [...prev, opt] : prev.filter((v) => v !== opt));
                  }} 
                  className="w-4 h-4 rounded transition-all" 
                  style={{ accentColor: primaryColor }}
                />
                <span className="font-medium">{opt}</span>
              </label>
            );
          })}
        </div>
      );
    case 'rating':
      return (
        <div className="flex gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = (value || 0) >= star;
            return (
              <button 
                key={star} 
                type="button" 
                onClick={() => onChange(star)}
                className="text-3xl transition-all duration-150 hover:scale-110 cursor-pointer"
                style={{ color: isActive ? primaryColor : '#E4E4E7' }}
              >
                ★
              </button>
            );
          })}
        </div>
      );
    case 'file':
      return (
        <div className="relative">
          <input 
            type="file" 
            className={`${base} text-text-secondary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-subtle file:text-accent hover:file:bg-accent/15 cursor-pointer`} 
            style={style}
            onChange={(e) => onChange(e.target.files?.[0]?.name || '')} 
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      );
    case 'signature':
      return (
        <div className="border border-border bg-base/40 rounded-xl p-4 space-y-3">
          <div className="h-16 border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-text-tertiary font-medium bg-surface">
            Signature Pad (type your full name below to sign)
          </div>
          <input 
            type="text" 
            placeholder="Type signature..." 
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-base text-text focus:outline-none" 
            style={{ focusBorderColor: primaryColor }}
            value={value ?? ''} 
            onChange={(e) => onChange(e.target.value)} 
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      );
    default:
      return null;
  }
}
