export default function HeatmapPanel({ fields, heatmapData = [] }) {
  const maxIntensity = Math.max(...heatmapData.map((h) => h.intensity), 1);

  return (
    <div className="bg-surface border border-border rounded-[10px] p-5">
      <h3 className="text-sm font-semibold text-text mb-4">Interaction Heatmap</h3>
      <div className="space-y-2">
        {(fields || []).map((field) => {
          const data = heatmapData.find((h) => h.fieldId === field.id);
          const intensity = data?.intensity || 0;
          const ratio = intensity / maxIntensity;
          const r = Math.round(248 * ratio);
          const g = Math.round(113 + (74 - 113) * ratio);
          const b = Math.round(113 + (222 - 113) * ratio);
          return (
            <div key={field.id} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-32 truncate">{field.label || field.type}</span>
              <div className="flex-1 h-7 rounded-md border border-border overflow-hidden relative"
                style={{ background: `rgba(${r},${g},${b},${0.15 + ratio * 0.5})` }}>
                <div className="absolute inset-0 flex items-center px-2 text-[11px] text-text-secondary">
                  {data ? `${data.clicks} clicks · ${data.focuses} focuses` : 'No data'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
