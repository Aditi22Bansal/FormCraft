import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Search, FileText, MessageSquare, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AppLayout from '../components/ui/AppLayout';
import Button from '../components/ui/Button';
import FormCard from '../components/dashboard/FormCard';
import AIGenerateModal from '../components/builder/AIGenerateModal';
import { PageSkeleton } from '../components/ui/Skeleton';
import api from '../lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/forms').then((res) => setForms(res.data)).catch((err) => toast.error(err.message)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (form) => {
    if (!confirm(`Delete "${form.title}"?`)) return;
    try { await api.delete(`/forms/${form._id}`); setForms((p) => p.filter((f) => f._id !== form._id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  const handleAI = async (fields) => {
    try { const res = await api.post('/forms', { title: 'AI Generated Form', fields }); navigate(`/forms/${res.data._id}/edit`); }
    catch (err) { toast.error(err.message); }
  };

  const totalResponses = forms.reduce((s, f) => s + (f.submissionCount || 0), 0);
  const activeForms = forms.filter((f) => f.status === 'active').length;
  const filteredForms = forms.filter((f) => f.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="px-8 py-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#6366F103_0%,transparent_50%)] pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-text font-sans">My Forms</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search forms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            </div>
            <Button variant="ghost" onClick={() => setAiOpen(true)}><Sparkles size={16} className="mr-1.5" /> Generate with AI</Button>
            <Button onClick={() => navigate('/forms/new')}><Plus size={16} className="mr-1.5" /> New Form</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
          {[
            { label: 'Total Forms', value: forms.length, icon: FileText, trend: '+1 created today', color: 'accent' },
            { label: 'Total Responses', value: totalResponses, icon: MessageSquare, trend: '+15.4% this week', color: 'success' },
            { label: 'Active Forms', value: activeForms, icon: Activity, trend: activeForms > 0 ? 'Live socket sync' : '0 active sessions', color: 'danger', animate: activeForms > 0 },
            { label: 'Avg Responses', value: forms.length ? Math.round(totalResponses / forms.length) : 0, icon: TrendingUp, trend: '92.4% avg completion', color: 'info' },
          ].map((m) => {
            const Icon = m.icon;
            const colorClasses = {
              accent: 'text-accent bg-accent-subtle border-accent/10',
              success: 'text-success bg-success/8 border-success/10',
              danger: 'text-danger bg-danger/8 border-danger/10',
              info: 'text-info bg-info/8 border-info/10',
            };
            return (
              <div key={m.label} className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:border-border/80 transition-all duration-150 flex items-start justify-between relative overflow-hidden group">
                <div className="space-y-2.5 relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{m.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-text tracking-tight">{m.value}</span>
                    <span className="text-[10px] font-semibold text-text-secondary">{m.trend}</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClasses[m.color]} ${
                  m.animate ? 'animate-pulse' : ''
                }`}>
                  <Icon size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {loading ? <PageSkeleton /> : forms.length === 0 ? (
          <div className="text-center py-24 bg-surface border border-border rounded-xl">
            <div className="w-14 h-14 bg-accent-subtle rounded-xl flex items-center justify-center mx-auto mb-4"><Plus size={24} className="text-accent" /></div>
            <h2 className="text-lg font-semibold text-text mb-1">No forms yet</h2>
            <p className="text-text-secondary text-sm mb-6">Create your first form or generate one with AI</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/forms/new')}>New Form</Button>
              <Button variant="ghost" onClick={() => setAiOpen(true)}>Generate with AI</Button>
            </div>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-xl">
            <h3 className="text-sm font-semibold text-text mb-1">No results found</h3>
            <p className="text-text-secondary text-xs">No forms matched the query "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => <FormCard key={form._id} form={form} onDelete={handleDelete} />)}
          </div>
        )}
      </motion.div>
      <AIGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} onConfirm={handleAI} />
    </AppLayout>
  );
}
