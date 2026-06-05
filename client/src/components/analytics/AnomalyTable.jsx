import Badge from '../ui/Badge';

export default function AnomalyTable({ anomalies = [], onReview }) {
  if (!anomalies.length) {
    return (
      <div className="bg-surface border border-border rounded-[10px] p-5">
        <h3 className="text-sm font-semibold text-text mb-2">Anomaly Detection</h3>
        <p className="text-sm text-text-secondary">No flagged responses detected.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text">Anomaly Detection ({anomalies.length})</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">ID</th>
            <th className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Reason</th>
            <th className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Confidence</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a) => (
            <tr key={a.id} className="border-b border-border hover:bg-elevated transition-colors duration-150">
              <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">{String(a.id).slice(-8)}</td>
              <td className="px-4 py-2.5 text-text-secondary">{a.reasons?.join(', ')}</td>
              <td className="px-4 py-2.5"><Badge variant={a.confidence}>{a.confidence}</Badge></td>
              <td className="px-4 py-2.5 text-right">
                <button onClick={() => onReview?.(a.id)} className="text-xs text-accent hover:underline">Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
