import { useDraggable } from '@dnd-kit/core';

const GROUPS = [
  { label: 'Basic', types: [
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'email', label: 'Email', icon: '@' },
    { type: 'number', label: 'Number', icon: '#' },
    { type: 'textarea', label: 'Long Text', icon: '¶' },
  ]},
  { label: 'Choice', types: [
    { type: 'dropdown', label: 'Dropdown', icon: '▼' },
    { type: 'radio', label: 'Radio', icon: '◉' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  ]},
  { label: 'Advanced', types: [
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'file', label: 'File', icon: '📎' },
    { type: 'rating', label: 'Rating', icon: '★' },
    { type: 'signature', label: 'Signature', icon: '✍' },
  ]},
];

function DraggableChip({ type, label, icon, onAdd }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${type}`, data: { type, fromPalette: true } });
  return (
    <button ref={setNodeRef} {...listeners} {...attributes} onClick={() => onAdd(type)}
      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-text bg-bg border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-150 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
      <span className="w-6 h-6 flex items-center justify-center bg-white border border-border rounded text-xs font-medium">{icon}</span>
      {label}
    </button>
  );
}

export default function FieldPalette({ onAdd }) {
  return (
    <div className="space-y-5">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">{group.label}</p>
          <div className="space-y-1.5">
            {group.types.map((t) => <DraggableChip key={t.type} {...t} onAdd={onAdd} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
