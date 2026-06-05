import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
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

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-text">My Forms</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setAiOpen(true)}><Sparkles size={16} className="mr-1.5" /> Generate with AI</Button>
            <Button onClick={() => navigate('/forms/new')}><Plus size={16} className="mr-1.5" /> New Form</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Forms', value: forms.length },
            { label: 'Total Responses', value: totalResponses },
            { label: 'Active Forms', value: activeForms },
            { label: 'Avg Responses', value: forms.length ? Math.round(totalResponses / forms.length) : 0 },
          ].map((m) => (
            <div key={m.label} className="bg-surface border border-border rounded-[10px] p-4">
              <p className="text-xl font-semibold text-text">{m.value}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {loading ? <PageSkeleton /> : forms.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-accent-subtle rounded-[10px] flex items-center justify-center mx-auto mb-4"><Plus size={24} className="text-accent" /></div>
            <h2 className="text-lg font-semibold text-text mb-1">No forms yet</h2>
            <p className="text-text-secondary text-sm mb-6">Create your first form or generate one with AI</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/forms/new')}>New Form</Button>
              <Button variant="ghost" onClick={() => setAiOpen(true)}>Generate with AI</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => <FormCard key={form._id} form={form} onDelete={handleDelete} />)}
          </div>
        )}
      </motion.div>
      <AIGenerateModal open={aiOpen} onClose={() => setAiOpen(false)} onConfirm={handleAI} />
    </AppLayout>
  );
}
