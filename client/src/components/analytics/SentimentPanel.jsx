import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Badge from '../ui/Badge';

const COLORS = { positive: '#4ADE80', neutral: '#8B8AA0', negative: '#F87171' };

export default function SentimentPanel({ sentimentByField = {}, responses = [] }) {
  const entries = Object.entries(sentimentByField);
  if (!entries.length) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {entries.map(([fieldId, { label, counts }]) => {
        const data = Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
        const fieldResponses = responses.filter((r) => {
          const ans = r.answers.find((a) => a.fieldId === fieldId);
          return ans?.sentiment?.label;
        });
        return (
          <div key={fieldId} className="bg-surface border border-border rounded-[10px] p-5">
            <h4 className="text-sm font-semibold text-text mb-3">{label}</h4>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                    {data.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E1E28', border: '1px solid #2A2A38', borderRadius: 6, fontSize: 12, color: '#F0EFF8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-text-tertiary">No sentiment data</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {fieldResponses.slice(0, 3).map((r) => {
                const ans = r.answers.find((a) => a.fieldId === fieldId);
                return <Badge key={r._id} variant={ans.sentiment.label}>{ans.sentiment.label}</Badge>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
