import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm max-w-sm animate-slide-up ${
        type === 'success'
          ? 'bg-white border border-green-200 text-green-800'
          : 'bg-white border border-red-200 text-red-800'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
}
