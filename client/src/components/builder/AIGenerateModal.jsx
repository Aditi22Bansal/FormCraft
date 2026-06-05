import { useState } from 'react';
import { Sparkles, Edit2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const EXAMPLES = [
  'Job application for software engineer',
  'Customer feedback form',
  'Event registration form',
];

export default function AIGenerateModal({ open, onClose, onConfirm }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleGenerate = async () => {
    if (!description.trim()) return toast.error('Please describe your form');
    setLoading(true);
    setPreview(null);
    setEditingIndex(null);
    try {
      const res = await api.post('/forms/generate-ai', { description: description.trim() });
      setPreview(res.data.fields);
      toast.success('Form generated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) { onConfirm(preview); onClose(); setPreview(null); setDescription(''); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate with AI" size="lg">
      <div className="space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your form… e.g. A customer satisfaction survey with rating, feedback, and contact info"
          rows={4}
          className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent resize-none"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setDescription(ex)}
              className="px-3 py-1.5 text-xs bg-surface border border-border rounded-full text-text-secondary hover:border-accent hover:text-accent transition-all duration-150 cursor-pointer">
              {ex}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-text-secondary py-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            Generating your form…
          </div>
        )}

        {preview && (
          <div className="border border-border rounded-xl p-4 space-y-2 max-h-60 overflow-y-auto">
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">Preview ({preview.length} fields)</p>
            {preview.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{f.type}</span>
                {editingIndex === i ? (
                  <input type="text" value={f.label} onChange={(e) => {
                    const next = [...preview];
                    next[i].label = e.target.value;
                    setPreview(next);
                  }} onBlur={() => setEditingIndex(null)} className="flex-1 px-2 py-0.5 border border-border rounded text-xs bg-surface text-text outline-none focus:ring-1 focus:ring-accent" autoFocus />
                ) : (
                  <>
                    <span className="text-text flex-1">{f.label}</span>
                    {f.required && <span className="text-danger text-xs">*</span>}
                    <button onClick={() => setEditingIndex(i)} className="p-1 text-text-tertiary hover:text-text rounded transition-colors duration-150 cursor-pointer">
                      <Edit2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {!preview ? (
            <Button onClick={handleGenerate} disabled={loading}>
              <Sparkles size={16} className="mr-1.5" />
              {loading ? 'Generating…' : 'Generate'}
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating…' : 'Regenerate'}
              </Button>
              <Button onClick={handleConfirm}>Looks good, open in builder</Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
