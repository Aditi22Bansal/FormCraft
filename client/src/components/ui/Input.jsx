export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary mb-1.5">{label}</label>}
      <input
        className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-150 ${error ? 'border-danger' : 'border-border'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
