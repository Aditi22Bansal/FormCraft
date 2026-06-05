import { Radio } from 'lucide-react';

export default function SessionTracker({ activeCount = 0, sessions = [] }) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Radio size={16} className={activeCount > 0 ? 'text-success animate-pulse' : 'text-text-tertiary'} />
        <h3 className="text-sm font-semibold text-text">
          {activeCount > 0 ? `${activeCount} filling this form right now` : 'No active sessions'}
        </h3>
      </div>
      {sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.sessionId} className="flex items-center justify-between text-xs px-3 py-2 bg-elevated rounded-lg border border-border">
              <span className="font-mono text-text-secondary">{s.sessionId}</span>
              <span className="text-text-tertiary">Field {s.currentFieldIndex + 1} · {s.timeElapsed}s</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
