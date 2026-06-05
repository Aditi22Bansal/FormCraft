import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft, Eye, Save, Globe, Plus, History } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { makeField, genFieldId } from '../utils/fieldLogic';
import FieldPalette from '../components/builder/FieldPalette';
import FormCanvas from '../components/builder/FormCanvas';
import FieldSettings from '../components/builder/FieldSettings';
import PreviewPanel from '../components/builder/PreviewPanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { PageSkeleton } from '../components/ui/Skeleton';
import Drawer from '../components/ui/Drawer';

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [steps, setSteps] = useState([]);
  const [settings, setSettings] = useState({ conversationalMode: false, quizMode: false, timeLimit: null, theme: { primaryColor: '#6366F1' } });
  const [selectedId, setSelectedId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/forms/${id}`).then((res) => {
      const f = res.data;
      setTitle(f.title);
      setDescription(f.description || '');
      setFields(f.fields || []);
      setSteps(f.steps || []);
      setSettings(f.settings || {});
    }).catch((err) => toast.error(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const loadVersions = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/forms/${id}/versions`);
      setVersions(res.data);
    } catch (err) {
      toast.error('Failed to load version history');
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadVersions();
    }
  }, [showHistory]);

  const handleRestoreVersion = async (versionNum) => {
    if (!confirm('Are you sure you want to restore this version? Your current changes will be saved to history first.')) return;
    try {
      const res = await api.post(`/forms/${id}/restore/${versionNum}`);
      const f = res.data;
      setTitle(f.title);
      setDescription(f.description || '');
      setFields(f.fields || []);
      setSteps(f.steps || []);
      setSettings(f.settings || {});
      toast.success(`Restored to version ${versionNum}!`);
      setShowHistory(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addField = (type) => {
    const field = makeField(type);
    setFields((prev) => [...prev, field]);
    setSelectedId(field.id);
  };

  const updateField = (updates) => {
    setFields((prev) => prev.map((f) => (f.id === selectedId ? { ...f, ...updates } : f)));
  };

  const removeField = (fieldId) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedId === fieldId) setSelectedId(null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    if (active.data.current?.fromPalette) {
      addField(active.data.current.type);
      return;
    }
    setFields((prev) => {
      const from = prev.findIndex((f) => f.id === active.id);
      const to = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, from, to);
    });
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) return toast.error('Please add a form title');
    setSaving(true);
    try {
      const payload = { title, description, fields, steps, settings, status: publish ? 'active' : 'draft' };
      if (isEdit) {
        const res = await api.put(`/forms/${id}`, payload);
        if (publish) {
          const publicUrl = `${window.location.origin}/f/${res.data.slug}`;
          navigator.clipboard.writeText(publicUrl);
          toast.success((t) => (
            <span>
              Form published! Link copied.{' '}
              <a href={publicUrl} target="_blank" rel="noreferrer" className="text-accent underline hover:text-accent-hover font-semibold">
                Open Form →
              </a>
            </span>
          ), { duration: 6000 });
        } else {
          toast.success('Form saved!');
        }
      } else {
        const res = await api.post('/forms', payload);
        toast.success('Form created!');
        navigate(`/forms/${res.data._id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { id: genFieldId(), title: `Step ${prev.length + 1}`, fieldIds: [] }]);
  };

  const selectedField = fields.find((f) => f.id === selectedId);

  if (loading) return <PageSkeleton />;

  return (
    <div className="h-screen flex flex-col bg-base overflow-hidden">
      <div className="h-14 bg-surface border-b border-border flex items-center gap-3 px-4 shrink-0">
        <button onClick={() => navigate('/dashboard')} className="p-1.5 text-text-secondary hover:text-text rounded-lg transition-colors duration-150">
          <ArrowLeft size={18} />
        </button>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-base font-semibold bg-transparent outline-none text-text min-w-0" placeholder="Form title…" />
        {isEdit && (
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}><History size={15} className="mr-1" /> History</Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}><Eye size={15} className="mr-1" /> Preview</Button>
        <Button variant="ghost" size="sm" onClick={() => handleSave(false)} disabled={saving}><Save size={15} className="mr-1" /> Save</Button>
        <Button size="sm" onClick={() => handleSave(true)} disabled={saving}><Globe size={15} className="mr-1" /> Publish</Button>
      </div>

      {/* 3-panel layout */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[260px] border-r border-border bg-surface p-4 overflow-y-auto shrink-0">
            <FieldPalette onAdd={addField} />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <FormCanvas fields={fields} selectedId={selectedId} onSelect={setSelectedId} onRemove={removeField} />
              </SortableContext>
            </div>
            <div className="border-t border-border bg-surface px-4 py-3 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={addStep}><Plus size={14} className="mr-1" /> Add Step</Button>
              {steps.map((step, i) => (
                <span key={step.id} className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium">{step.title || `Step ${i + 1}`}</span>
              ))}
            </div>
          </div>

          <div className="w-[300px] border-l border-border bg-surface p-4 overflow-y-auto shrink-0">
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-4">Field Settings</p>
            <FieldSettings field={selectedField} allFields={fields} onUpdate={updateField} quizMode={settings.quizMode} />
            <div className="border-t border-border mt-6 pt-4 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-3">Form Settings</p>
              
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Form description for respondents" />
              
              <label className="flex items-center justify-between text-sm text-text">
                Conversational mode
                <button onClick={() => setSettings((s) => ({ ...s, conversationalMode: !s.conversationalMode }))}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 ${settings.conversationalMode ? 'bg-accent' : 'bg-border'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150 ${settings.conversationalMode ? 'translate-x-4' : ''}`} />
                </button>
              </label>

              <label className="flex items-center justify-between text-sm text-text">
                Quiz mode
                <button onClick={() => setSettings((s) => ({ ...s, quizMode: !s.quizMode }))}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-150 ${settings.quizMode ? 'bg-accent' : 'bg-border'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150 ${settings.quizMode ? 'translate-x-4' : ''}`} />
                </button>
              </label>

              {settings.quizMode && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Time Limit (seconds)</label>
                  <input type="number" value={settings.timeLimit || ''} onChange={(e) => setSettings((s) => ({ ...s, timeLimit: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="No time limit" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Thank You Message</label>
                <input type="text" value={settings.thankYouMessage || ''} onChange={(e) => setSettings((s) => ({ ...s, thankYouMessage: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Thank you for your submission!" />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Redirect URL</label>
                <input type="text" value={settings.redirectUrl || ''} onChange={(e) => setSettings((s) => ({ ...s, redirectUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-1 focus:ring-accent" placeholder="https://example.com" />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">Accent Color</label>
                <div className="flex gap-2">
                  {['#6366F1', '#7C6FCD', '#10B981', '#EF4444', '#3B82F6', '#EC4899'].map((color) => (
                    <button key={color} type="button" onClick={() => setSettings((s) => ({ ...s, theme: { ...s.theme, primaryColor: color } }))}
                      className="w-6 h-6 rounded-full border border-border relative transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: color }}>
                      {(settings.theme?.primaryColor || '#6366F1') === color && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white">✓</span>
                      )}
                    </button>
                  ))}
                  <input type="color" value={settings.theme?.primaryColor || '#6366F1'} onChange={(e) => setSettings((s) => ({ ...s, theme: { ...s.theme, primaryColor: e.target.value } }))}
                    className="w-6 h-6 rounded border border-border p-0 cursor-pointer bg-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      <PreviewPanel open={showPreview} onClose={() => setShowPreview(false)} title={title} fields={fields} primaryColor={settings.theme?.primaryColor} />
      
      <Drawer open={showHistory} onClose={() => setShowHistory(false)}>
        <div className="p-6">
          <h3 className="font-semibold text-text mb-1">Version History</h3>
          <p className="text-xs text-text-tertiary mb-6">Select a previous saved state to restore it</p>
          {versions.length === 0 ? (
            <p className="text-sm text-text-secondary">No previous versions saved yet.</p>
          ) : (
            <div className="space-y-3">
              {versions.map((v) => (
                <div key={v.version} className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text">Version {v.version}</span>
                    <span className="text-xs text-text-tertiary">{new Date(v.savedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{v.title}</p>
                  <p className="text-xs text-text-tertiary">{v.fields?.length || 0} fields</p>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => handleRestoreVersion(v.version)}>
                    Restore this version
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
