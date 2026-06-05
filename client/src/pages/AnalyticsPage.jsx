import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AppLayout from '../components/ui/AppLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import { PageSkeleton } from '../components/ui/Skeleton';
import HealthScore from '../components/analytics/HealthScore';
import HeatmapPanel from '../components/analytics/HeatmapPanel';
import SessionTracker from '../components/analytics/SessionTracker';
import AnomalyTable from '../components/analytics/AnomalyTable';
import DropoffChart from '../components/analytics/DropoffChart';
import SentimentPanel from '../components/analytics/SentimentPanel';
import JourneyTimeline from '../components/analytics/JourneyTimeline';
import { useLiveSessions } from '../hooks/useSocket';
import api from '../lib/api';

const chartTooltip = { background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: 6, fontSize: 12, color: '#18181B' };

export default function AnalyticsPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [data, setData] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const live = useLiveSessions(id);

  useEffect(() => {
    Promise.all([
      api.get(`/forms/${id}`),
      api.get(`/forms/${id}/analytics`),
      api.get(`/track/${id}/heatmap`).catch(() => ({ data: [] })),
    ]).then(([f, a, h]) => { setForm(f.data); setData(a.data); setHeatmap(h.data || []); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const openDrawer = async (responseId) => {
    const res = await api.get(`/responses/${responseId}`);
    setDrawer(res.data);
    const c = await api.get(`/responses/${responseId}/comments`).catch(() => ({ data: [] }));
    setComments(c.data || []);
  };

  const addComment = async () => {
    if (!comment.trim() || !drawer) return;
    const res = await api.post(`/responses/${drawer.response._id}/comments`, { text: comment });
    setComments((p) => [res.data, ...p]);
    setComment('');
    toast.success('Note added');
  };

  if (loading) return <AppLayout><PageSkeleton /></AppLayout>;
  const { stats, health, trends, dropOff, choiceDistribution, sentimentByField, anomalies, responses } = data || {};

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="px-8 py-6">
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-4 transition-colors duration-150">
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text">{form?.title}</h1>
            <Badge variant={form?.status}>{form?.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${location.origin}/f/${form?.slug}`); toast.success('Link copied'); }}>
              <Share2 size={14} className="mr-1" /> Share
            </Button>
            <Button variant="ghost" size="sm" onClick={async () => {
              const res = await fetch(`/api/forms/${id}/responses/export`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
              const blob = await res.blob(); const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `${form.slug}.csv`; a.click();
            }}><Download size={14} className="mr-1" /> Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Views', value: stats?.totalViews },
            { label: 'Submissions', value: stats?.totalSubmissions },
            { label: 'Completion', value: `${stats?.completionRate}%` },
            { label: 'Avg Time', value: `${stats?.avgCompletionTime}s` },
          ].map((m) => (
            <div key={m.label} className="bg-surface border border-border rounded-[10px] p-4">
              <p className="text-xl font-semibold text-text">{m.value}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6"><HealthScore score={health?.score} suggestions={health?.suggestions} /></div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <h3 className="text-sm font-semibold text-text mb-4">Submissions Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {Object.entries(choiceDistribution || {}).slice(0, 1).map(([fid, { label, data: cd }]) => (
            <div key={fid} className="bg-surface border border-border rounded-[10px] p-5">
              <h3 className="text-sm font-semibold text-text mb-4">Distribution: {label}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cd}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <DropoffChart dropOff={dropOff} />
          <SessionTracker activeCount={live.activeCount || data?.liveSessions?.activeCount} sessions={live.sessions?.length ? live.sessions : data?.liveSessions?.sessions} />
        </div>

        <div className="mb-6"><HeatmapPanel fields={form?.fields} heatmapData={heatmap} /></div>
        <div className="mb-6"><SentimentPanel sentimentByField={sentimentByField} responses={responses} /></div>
        <div className="mb-6"><AnomalyTable anomalies={anomalies} onReview={openDrawer} /></div>

        <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-text">Responses ({responses?.length})</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {['Date', 'Time', 'Sentiment', ''].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {(responses || []).map((r) => {
                const sents = r.answers.filter((a) => a.sentiment?.label).map((a) => a.sentiment.label);
                const overall = sents.includes('negative') ? 'negative' : sents.includes('positive') ? 'positive' : 'neutral';
                return (
                  <tr key={r._id} className="border-b border-border hover:bg-elevated transition-colors duration-150">
                    <td className="px-4 py-2.5 text-text-secondary">{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{r.completionTime}s</td>
                    <td className="px-4 py-2.5"><Badge variant={overall}>{overall}</Badge></td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => openDrawer(r._id)} className="text-xs text-accent hover:underline">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}>
        {drawer && (
          <div className="p-6">
            <h3 className="font-semibold text-text mb-1">Response Detail</h3>
            <p className="text-xs text-text-tertiary mb-6">{new Date(drawer.response.submittedAt).toLocaleString()}</p>
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary mb-3">Journey Timeline</h4>
            <JourneyTimeline journeyLog={drawer.response.journeyLog} fields={drawer.form?.fields} />
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary mt-6 mb-3">Answers</h4>
            {(drawer.form?.fields || []).map((f) => {
              const ans = drawer.response.answers.find((a) => a.fieldId === f.id);
              return (
                <div key={f.id} className="border-b border-border py-3">
                  <p className="text-xs text-text-tertiary">{f.label}</p>
                  <p className="text-sm text-text mt-1">{Array.isArray(ans?.value) ? ans.value.join(', ') : ans?.value ?? '—'}</p>
                  {ans?.sentiment && <Badge variant={ans.sentiment.label} className="mt-1">{ans.sentiment.label}</Badge>}
                </div>
              );
            })}
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary mt-6 mb-2">Notes</h4>
            {comments.map((c) => <p key={c._id} className="text-sm bg-elevated rounded-lg p-2 mb-2 text-text-secondary">{c.text}</p>)}
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Add a note…"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text resize-none" />
            <Button size="sm" className="mt-2" onClick={addComment}>Add Note</Button>
          </div>
        )}
      </Drawer>
    </AppLayout>
  );
}
