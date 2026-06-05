import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart2,
  Download,
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import api from '../utils/api';

export default function ResponsesPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/forms/${id}`),
      api.get(`/forms/${id}/responses`),
      api.get(`/forms/${id}/responses/trends`),
    ])
      .then(([formRes, respRes, trendsRes]) => {
        setForm(formRes.data);
        setResponses(respRes.data);
        setTrends(trendsRes.data);
      })
      .catch((err) => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/forms/${id}/responses/export`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form?.slug ?? id}-responses.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: 'CSV downloaded', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const getCellValue = (response, field) => {
    const ans = response.answers.find((a) => a.fieldId === field.id);
    if (ans === undefined) return '—';
    if (Array.isArray(ans.value)) return ans.value.join(', ');
    return ans.value ?? '—';
  };

  if (loading) return <><Navbar /><Spinner /></>;

  const fields = form?.fields ?? [];
  const firstDate = responses.length
    ? new Date(responses[responses.length - 1].submittedAt).toLocaleDateString()
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{form?.title}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form?.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              v{form?.version} · {fields.length} field{fields.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || responses.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={15} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<Users size={18} className="text-indigo-500" />} label="Total Responses" value={responses.length} />
          <StatCard icon={<TrendingUp size={18} className="text-green-500" />} label="Days Active" value={trends.length} />
          <StatCard icon={<Calendar size={18} className="text-purple-500" />} label="First Response" value={firstDate ?? 'None'} small />
        </div>

        {/* Trend chart */}
        {trends.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-500" />
              Submission Trends
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Responses table */}
        {responses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Users size={36} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-gray-700 font-medium mb-1">No responses yet</h2>
            <p className="text-gray-400 text-sm">Share the form link to start collecting responses.</p>
            <a
              href={`/f/${form?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-indigo-600 hover:underline text-sm"
            >
              Open public form →
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                All Responses
                <span className="ml-2 text-sm font-normal text-gray-400">({responses.length})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Submitted At
                    </th>
                    {fields.map((f) => (
                      <th
                        key={f.id}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {f.label || `(${f.type})`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {responses.map((resp) => (
                    <tr key={resp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(resp.submittedAt).toLocaleString()}
                      </td>
                      {fields.map((f) => (
                        <td key={f.id} className="px-4 py-3 max-w-[200px] truncate text-gray-700">
                          {getCellValue(resp, f)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, small }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className={`font-bold text-gray-900 ${small ? 'text-base' : 'text-2xl'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
