import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import FieldRenderer from '../public/FieldRenderer';

function SortableField({ field, selected, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style}
      onClick={() => onSelect(field.id)}
      className={`bg-surface border rounded-xl p-4 cursor-pointer transition-all duration-150 ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'}`}>
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 text-text-secondary/40 hover:text-text-secondary cursor-grab touch-none" onClick={(e) => e.stopPropagation()}>
          <GripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-text mb-1">
            {field.label || <span className="text-text-secondary italic">Untitled {field.type}</span>}
            {field.required && <span className="text-error ml-1">*</span>}
          </label>
          {field.helperText && <p className="text-xs text-text-secondary mb-2">{field.helperText}</p>}
          <FieldRenderer field={field} value="" onChange={() => {}} />
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onSelect(field.id); }} className="p-1.5 text-text-secondary hover:text-primary rounded-lg"><Pencil size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(field.id); }} className="p-1.5 text-text-secondary hover:text-error rounded-lg"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function FormCanvas({ fields, selectedId, onSelect, onRemove }) {
  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-xl text-text-secondary text-sm">
        Drag fields here or click from the palette
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <SortableField key={field.id} field={field} selected={selectedId === field.id}
          onSelect={onSelect} onRemove={onRemove} />
      ))}
    </div>
  );
}
