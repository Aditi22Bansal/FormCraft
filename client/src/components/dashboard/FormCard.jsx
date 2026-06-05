import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Share2, Copy, Trash2, BarChart2, Code, FileText, ArrowUpRight } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Generates a nice deterministic curvy path for the SVG sparkline
const getSparklinePath = (id) => {
  const seed = id.charCodeAt(id.length - 1) || 5;
  const points = [
    [0, 30],
    [20, 20 + (seed % 15)],
    [40, 25 - (seed % 10)],
    [60, 35 - (seed % 20)],
    [80, 15 + (seed % 12)],
    [100, 10 + (seed % 5)],
    [120, 25],
    [140, 5 + (seed % 10)],
    [160, 20],
  ];
  return {
    line: `M ${points.map(p => p.join(',')).join(' L ')}`,
    fill: `M 0,40 L ${points.map(p => p.join(',')).join(' L ')} L 160,40 Z`
  };
};

export default function FormCard({ form, onDelete }) {
  const navigate = useNavigate();
  const [embedOpen, setEmbedOpen] = useState(false);
  const publicUrl = `${window.location.origin}/f/${form.slug}`;
  const embedCode = `<script src="${window.location.origin}/widget.js" data-form-id="${form.slug}"></script>`;
  
  const handleDuplicate = async (e) => {
    e.stopPropagation();
    try { 
      const res = await api.post(`/forms/${form._id}/duplicate`); 
      toast.success('Duplicated'); 
      navigate(`/forms/${res.data._id}/edit`); 
    } catch (err) { 
      toast.error(err.message); 
    }
  };

  const sparkPath = getSparklinePath(form._id);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/8 text-success border border-success/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
            </span>
            Active
          </div>
        );
      case 'closed':
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-text-tertiary/10 text-text-secondary border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
            Closed
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/8 text-accent border border-accent/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
            </span>
            Draft
          </div>
        );
    }
  };

  return (
    <>
      <div 
        onClick={() => navigate(`/forms/${form._id}/edit`)}
        className="bg-surface border border-border rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-accent/20 transition-all duration-200 relative group flex flex-col justify-between min-h-[190px] cursor-pointer"
      >
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-text truncate group-hover:text-accent transition-colors duration-150">{form.title}</h3>
            {getStatusBadge(form.status)}
          </div>
          <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
            Updated {new Date(form.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Dynamic Sparkline Graph visualization representation */}
        <div className="h-10 my-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-text tracking-tight">{form.submissionCount ?? 0}</span>
            <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">Responses</span>
          </div>
          
          <div className="w-40 h-8 opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full" viewBox="0 0 160 40">
              <defs>
                <linearGradient id={`grad-${form._id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={sparkPath.fill} fill={`url(#grad-${form._id})`} />
              <path d={sparkPath.line} fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Toolbar quick actions row */}
        <div className="border-t border-border/50 pt-3 flex items-center justify-between text-text-secondary">
          <div className="flex gap-0.5">
            {[
              { icon: Edit3, label: 'Edit Form', onClick: (e) => { e.stopPropagation(); navigate(`/forms/${form._id}/edit`); } },
              { icon: BarChart2, label: 'Analytics', onClick: (e) => { e.stopPropagation(); navigate(`/forms/${form._id}/analytics`); } },
              { icon: Code, label: 'Embed Script', onClick: (e) => { e.stopPropagation(); setEmbedOpen(true); } },
              { icon: Copy, label: 'Duplicate', onClick: handleDuplicate },
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={item.onClick}
                title={item.label}
                className="p-1.5 hover:bg-elevated hover:text-text rounded-lg transition-colors cursor-pointer text-text-secondary/70"
              >
                <item.icon size={13} />
              </button>
            ))}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(form); }} 
            title="Delete Form"
            className="p-1.5 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors cursor-pointer text-text-tertiary"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <Modal open={embedOpen} onClose={() => setEmbedOpen(false)} title="Embed Form OS Widget">
        <div className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Copy and paste this script tag anywhere inside your website's HTML body where you want the Form widget to mount:
          </p>
          <div className="relative">
            <code className="block bg-elevated border border-border rounded-lg p-3 text-[11px] font-mono text-text-secondary break-all">
              {embedCode}
            </code>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEmbedOpen(false)}>Close</Button>
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(embedCode); toast.success('Copied Embed Code'); }}>Copy Script</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
