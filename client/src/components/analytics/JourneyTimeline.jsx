export default function JourneyTimeline({ journeyLog = [], fields = [] }) {
  if (!journeyLog.length) return <p className="text-sm text-text-secondary">No journey data recorded.</p>;

  const getColor = (time) => {
    if (time < 5) return 'border-success bg-success/10';
    if (time < 15) return 'border-warning bg-warning/10';
    return 'border-danger bg-danger/10';
  };

  return (
    <div className="space-y-0">
      {journeyLog.map((entry, i) => {
        const field = fields.find((f) => f.id === entry.fieldId);
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${getColor(entry.timeSpent)}`} />
              {i < journeyLog.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            <div className="pb-4 flex-1">
              <p className="text-sm font-medium text-text">{field?.label || entry.fieldId}</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                {entry.timeSpent}s spent{entry.changedValue ? ' · changed answer' : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
