import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Eye,
  EyeOff,
  Copy,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import FieldRenderer from '../components/FieldRenderer';
import api from '../utils/api';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: '✏️' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'textarea', label: 'Long Text', icon: '📝' },
  { type: 'dropdown', label: 'Dropdown', icon: '▼' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'radio', label: 'Radio', icon: '🔘' },
  { type: 'date', label: 'Date', icon: '📅' },
];

function genId() {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeField(type) {
  return {
    id: genId(),
    type,
    label: '',
    placeholder: '',
    required: false,
    options: ['option-types', 'dropdown', 'radio', 'checkbox'].includes(type)
      ? ['Option 1', 'Option 2']
      : [],
    conditional: { fieldId: null, operator: 'equals', value: '' },
  };
}

function evaluateCondition(field, answers) {
  if (!field.conditional?.fieldId) return true;
  const answer = answers.find((a) => a.fieldId === field.conditional.fieldId);
  const target = Array.isArray(answer?.value) ? answer.value.join(',') : String(answer?.value ?? '');
  switch (field.conditional.operator) {
    case 'equals': return target === field.conditional.value;
    case 'not_equals': return target !== field.conditional.value;
    case 'contains': return target.includes(field.conditional.value);
    default: return true;
  }
}

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('Untitled Form');
  const [fields, setFields] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/forms/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setFields(res.data.fields || []);
      })
      .catch((err) => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const addField = (type) => {
    const field = makeField(type);
    setFields((prev) => [...prev, field]);
    setExpandedId(field.id);
  };

  const updateField = (fieldId, updates) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  const removeField = (fieldId) => {
    setFields((prev) => {
      const updated = prev.filter((f) => f.id !== fieldId);
      return updated.map((f) => {
        if (f.conditional?.fieldId === fieldId) {
          return { ...f, conditional: { fieldId: null, operator: 'equals', value: '' } };
        }
        return f;
      });
    });
    if (expandedId === fieldId) setExpandedId(null);
  };

  const duplicateField = (field) => {
    const copy = { ...field, id: genId() };
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === field.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setExpandedId(copy.id);
  };

  const handleDragStart = ({ active }) => setActiveDragId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const from = prev.findIndex((f) => f.id === active.id);
      const to = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, from, to);
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ message: 'Please add a form title', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/forms/${id}`, { title, fields });
        setToast({ message: 'Form saved!', type: 'success' });
      } else {
        const res = await api.post('/forms', { title, fields });
        setToast({ message: 'Form created!', type: 'success' });
        setTimeout(() => navigate(`/forms/${res.data._id}/edit`), 800);
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const visibleFields = showPreview
    ? fields.filter((f) => evaluateCondition(f, previewAnswers))
    : fields;

  const activeField = fields.find((f) => f.id === activeDragId);

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Top bar */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form title…"
            className="flex-1 min-w-0 text-base font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-300"
          />
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              showPreview
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            <span className="hidden sm:inline">{showPreview ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            <Save size={15} />
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`flex gap-6 ${showPreview ? '' : 'max-w-3xl mx-auto'}`}>

          {/* Builder panel */}
          <div className={`flex-1 min-w-0 ${showPreview ? 'max-w-[55%]' : 'w-full'}`}>
            {/* Field palette */}
            {!showPreview && (
              <div className="mb-5 bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Add field
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {FIELD_TYPES.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => addField(type)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 text-xs text-gray-600 hover:text-indigo-700 transition-colors"
                    >
                      <span className="text-lg leading-none">{icon}</span>
                      <span className="text-[10px] text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sortable field list */}
            {fields.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <p className="text-sm">Add fields from the palette above</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {fields.map((field, idx) => (
                      <SortableFieldCard
                        key={field.id}
                        field={field}
                        index={idx}
                        allFields={fields}
                        expanded={expandedId === field.id}
                        onToggle={() => setExpandedId(expandedId === field.id ? null : field.id)}
                        onUpdate={(updates) => updateField(field.id, updates)}
                        onRemove={() => removeField(field.id)}
                        onDuplicate={() => duplicateField(field)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeField && (
                    <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-xl opacity-90">
                      <p className="text-sm font-medium text-gray-700">
                        {activeField.label || `Untitled ${activeField.type}`}
                      </p>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Preview panel */}
          {showPreview && (
            <div className="flex-1 min-w-0 max-w-[45%]">
              <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Live Preview
                </p>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{title || 'Untitled Form'}</h2>
                {visibleFields.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No visible fields</p>
                ) : (
                  <div className="space-y-5">
                    {visibleFields.map((field) => {
                      const ans = previewAnswers.find((a) => a.fieldId === field.id);
                      return (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {field.label || <em className="text-gray-400">Untitled field</em>}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <FieldRenderer
                            field={field}
                            value={ans?.value}
                            onChange={(val) => {
                              setPreviewAnswers((prev) => {
                                const next = prev.filter((a) => a.fieldId !== field.id);
                                return [...next, { fieldId: field.id, value: val }];
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sortable field card ──────────────────────────────────────────────── */

function SortableFieldCard({ field, index, allFields, expanded, onToggle, onUpdate, onRemove, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const fieldLabel = FIELD_TYPES.find((t) => t.type === field.type);
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(field.type);

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none p-1 -ml-1"
        >
          <GripVertical size={16} />
        </button>
        <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}</span>
        <span className="text-base leading-none">{fieldLabel?.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700 truncate">
            {field.label || <em className="text-gray-400 font-normal">Untitled {field.type}</em>}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={onDuplicate} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Duplicate">
            <Copy size={14} />
          </button>
          <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
          <button onClick={onToggle} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 py-4 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder={`${fieldLabel?.label} label…`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Placeholder (not for checkbox/radio) */}
          {!['checkbox', 'radio'].includes(field.type) && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
              <input
                type="text"
                value={field.placeholder}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="Hint text…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Options */}
          {hasOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Options</label>
              <div className="space-y-2">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...field.options];
                        opts[i] = e.target.value;
                        onUpdate({ options: opts });
                      }}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => onUpdate({ options: field.options.filter((_, j) => j !== i) })}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-1"
                >
                  <Plus size={13} /> Add option
                </button>
              </div>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Required</span>
            <button
              onClick={() => onUpdate({ required: !field.required })}
              className={`relative w-9 h-5 rounded-full transition-colors ${field.required ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Conditional logic */}
          <ConditionalEditor field={field} allFields={allFields} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

/* ── Conditional logic editor ────────────────────────────────────────── */

function ConditionalEditor({ field, allFields, onUpdate }) {
  const otherFields = allFields.filter((f) => f.id !== field.id);
  const cond = field.conditional || { fieldId: null, operator: 'equals', value: '' };
  const condField = otherFields.find((f) => f.id === cond.fieldId);

  const hasCondition = Boolean(cond.fieldId);

  return (
    <div className="border-t border-gray-50 pt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">Conditional logic</span>
        {hasCondition && (
          <button
            onClick={() => onUpdate({ conditional: { fieldId: null, operator: 'equals', value: '' } })}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>

      {otherFields.length === 0 ? (
        <p className="text-xs text-gray-400">Add more fields to enable conditions</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
            <span className="shrink-0">Show if</span>
            <select
              value={cond.fieldId || ''}
              onChange={(e) =>
                onUpdate({ conditional: { ...cond, fieldId: e.target.value || null } })
              }
              className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="">— always show —</option>
              {otherFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label || `Untitled ${f.type}`}
                </option>
              ))}
            </select>
            {hasCondition && (
              <>
                <select
                  value={cond.operator}
                  onChange={(e) => onUpdate({ conditional: { ...cond, operator: e.target.value } })}
                  className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">not equals</option>
                  <option value="contains">contains</option>
                </select>
                {condField?.type === 'dropdown' || condField?.type === 'radio' ? (
                  <select
                    value={cond.value}
                    onChange={(e) => onUpdate({ conditional: { ...cond, value: e.target.value } })}
                    className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">— any —</option>
                    {(condField.options || []).map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => onUpdate({ conditional: { ...cond, value: e.target.value } })}
                    placeholder="value"
                    className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24"
                  />
                )}
              </>
            )}
          </div>
          {hasCondition && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
              <AlertCircle size={12} />
              <span>This field is hidden until condition is met</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
