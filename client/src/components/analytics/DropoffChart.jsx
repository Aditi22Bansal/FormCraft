export default function DropoffChart({ dropOff = [] }) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5">
      <h3 className="text-sm font-semibold text-text mb-4">Drop-off Analysis</h3>
      <div className="space-y-3">
        {dropOff.map((item) => {
          const severity = 100 - item.percentage;
          const color = severity > 40 ? '#F87171' : severity > 20 ? '#FBBF24' : '#4ADE80';
          return (
            <div key={item.fieldId}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary truncate max-w-[60%]">{item.label}</span>
                <span className="text-text-tertiary">{item.percentage}% reached</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
