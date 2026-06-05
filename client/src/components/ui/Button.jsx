export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs rounded-lg', md: 'px-4 py-2 text-sm rounded-lg', lg: 'px-6 py-2.5 text-sm rounded-lg' };
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    ghost: 'bg-transparent text-text-secondary border border-border hover:bg-elevated',
    danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
