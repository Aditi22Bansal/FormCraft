const styles = {
  active: 'bg-success/10 text-success border-success/20',
  draft: 'bg-elevated text-text-secondary border-border',
  closed: 'bg-elevated text-text-tertiary border-border',
  positive: 'bg-success/10 text-success',
  negative: 'bg-danger/10 text-danger',
  neutral: 'bg-elevated text-text-secondary',
  high: 'bg-danger/10 text-danger',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-elevated text-text-secondary',
};

export default function Badge({ children, variant = 'draft' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${styles[variant] || styles.draft}`}>
      {children}
    </span>
  );
}
