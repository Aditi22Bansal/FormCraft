import { useDraggable } from '@dnd-kit/core';
import { 
  Type, Mail, Hash, AlignLeft, List, CircleDot, CheckSquare, Calendar, Paperclip, Star, PenTool 
} from 'lucide-react';

const GROUPS = [
  { label: 'Basic Fields', types: [
    { type: 'text', label: 'Short Text', icon: Type },
    { type: 'email', label: 'Email Address', icon: Mail },
    { type: 'number', label: 'Number Input', icon: Hash },
    { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  ]},
  { label: 'Choice Fields', types: [
    { type: 'dropdown', label: 'Dropdown Selector', icon: List },
    { type: 'radio', label: 'Single Choice (Radio)', icon: CircleDot },
    { type: 'checkbox', label: 'Multiple Choice (Check)', icon: CheckSquare },
  ]},
  { label: 'Advanced Fields', types: [
    { type: 'date', label: 'Date Selector', icon: Calendar },
    { type: 'file', label: 'File Attachment', icon: Paperclip },
    { type: 'rating', label: 'Star Rating', icon: Star },
    { type: 'signature', label: 'Signature Draw', icon: PenTool },
  ]},
];

function DraggableChip({ type, label, icon: Icon, onAdd }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${type}`, data: { type, fromPalette: true } });
  return (
    <button ref={setNodeRef} {...listeners} {...attributes} onClick={() => onAdd(type)}
      className={`flex items-center gap-3 w-full px-3 py-2 text-xs text-text-secondary bg-base border border-border/80 rounded-lg hover:border-accent hover:text-text hover:bg-accent-subtle transition-all duration-150 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
      <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-surface border border-border rounded text-accent">
        <Icon size={12} />
      </span>
      <span className="font-semibold truncate">{label}</span>
    </button>
  );
}

export default function FieldPalette({ onAdd }) {
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-3">{group.label}</p>
          <div className="space-y-1.5">
            {group.types.map((t) => <DraggableChip key={t.type} {...t} onAdd={onAdd} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
