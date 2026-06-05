import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit3, Share2, Copy, Trash2, BarChart2, Code } from 'lucide-react';
import Badge from '../ui/Badge';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

export default function FormCard({ form, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const publicUrl = `${window.location.origin}/f/${form.slug}`;
  const embedCode = `<script src="${window.location.origin}/widget.js" data-form-id="${form.slug}"></script>`;

  const handleDuplicate = async () => {
    try { const res = await api.post(`/forms/${form._id}/duplicate`); toast.success('Duplicated'); navigate(`/forms/${res.data._id}/edit`); }
    catch (err) { toast.error(err.message); }
    setMenuOpen(false);
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-[10px] p-5 hover:bg-elevated transition-all duration-150 relative group">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-medium text-text truncate flex-1">{form.title}</h3>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-text-tertiary hover:text-text rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-elevated border border-border rounded-[10px] py-1 w-44 shadow-lg">
                  <MenuItem icon={Edit3} label="Edit" onClick={() => { navigate(`/forms/${form._id}/edit`); setMenuOpen(false); }} />
                  <MenuItem icon={BarChart2} label="Analytics" onClick={() => { navigate(`/forms/${form._id}/analytics`); setMenuOpen(false); }} />
                  <MenuItem icon={Share2} label="Share" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Copied'); setMenuOpen(false); }} />
                  <MenuItem icon={Code} label="Embed" onClick={() => { setEmbedOpen(true); setMenuOpen(false); }} />
                  <MenuItem icon={Copy} label="Duplicate" onClick={handleDuplicate} />
                  <MenuItem icon={Trash2} label="Delete" onClick={() => { onDelete(form); setMenuOpen(false); }} danger />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
          <span>{form.submissionCount ?? 0} responses</span>
          <span>·</span>
          <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
        </div>
        <Badge variant={form.status === 'active' ? 'active' : form.status === 'closed' ? 'closed' : 'draft'}>
          {form.status === 'active' ? 'Active' : form.status === 'closed' ? 'Closed' : 'Draft'}
        </Badge>
      </div>
      <Modal open={embedOpen} onClose={() => setEmbedOpen(false)} title="Embed Code">
        <p className="text-sm text-text-secondary mb-3">Add this script to any website:</p>
        <code className="block bg-elevated border border-border rounded-lg p-3 text-xs font-mono text-text-secondary break-all">{embedCode}</code>
        <button onClick={() => { navigator.clipboard.writeText(embedCode); toast.success('Copied'); }} className="mt-3 text-sm text-accent hover:underline">Copy code</button>
      </Modal>
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors duration-150 ${danger ? 'text-danger hover:bg-danger/10' : 'text-text-secondary hover:bg-base hover:text-text'}`}>
      <Icon size={14} /> {label}
    </button>
  );
}
