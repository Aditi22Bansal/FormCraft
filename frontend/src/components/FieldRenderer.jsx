/**
 * Renders a single form field for preview / public filling.
 * Pass value + onChange for controlled usage (public form).
 * Omit them for static preview.
 */
export default function FieldRenderer({ field, value, onChange, error }) {
  const baseInput =
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ' +
    (error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white');

  const controlled = onChange !== undefined;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <input
          type={field.type}
          placeholder={field.placeholder}
          required={field.required}
          className={baseInput}
          value={controlled ? (value ?? '') : undefined}
          onChange={controlled ? (e) => onChange(e.target.value) : undefined}
          readOnly={!controlled}
        />
      );

    case 'textarea':
      return (
        <textarea
          rows={3}
          placeholder={field.placeholder}
          required={field.required}
          className={`${baseInput} resize-none`}
          value={controlled ? (value ?? '') : undefined}
          onChange={controlled ? (e) => onChange(e.target.value) : undefined}
          readOnly={!controlled}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          required={field.required}
          className={baseInput}
          value={controlled ? (value ?? '') : undefined}
          onChange={controlled ? (e) => onChange(e.target.value) : undefined}
          readOnly={!controlled}
        />
      );

    case 'dropdown':
      return (
        <select
          required={field.required}
          className={`${baseInput} cursor-pointer`}
          value={controlled ? (value ?? '') : undefined}
          onChange={controlled ? (e) => onChange(e.target.value) : undefined}
          disabled={!controlled}
        >
          <option value="">{field.placeholder || 'Select an option…'}</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="flex flex-col gap-2">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt}
                className="accent-indigo-600"
                checked={controlled ? value === opt : undefined}
                onChange={controlled ? () => onChange(opt) : undefined}
                disabled={!controlled}
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex flex-col gap-2">
          {(field.options || []).map((opt, i) => {
            const checked = Array.isArray(value) ? value.includes(opt) : false;
            return (
              <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={opt}
                  className="accent-indigo-600"
                  checked={controlled ? checked : undefined}
                  onChange={
                    controlled
                      ? (e) => {
                          const prev = Array.isArray(value) ? value : [];
                          onChange(
                            e.target.checked
                              ? [...prev, opt]
                              : prev.filter((v) => v !== opt)
                          );
                        }
                      : undefined
                  }
                  disabled={!controlled}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}
