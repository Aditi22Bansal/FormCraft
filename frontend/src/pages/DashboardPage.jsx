import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit3, BarChart2, Trash2, ExternalLink, FileText, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchForms = () => {
    setLoading(true);
    api
      .get('/forms')
      .then((res) => setForms(res.data))
      .catch((err) => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (form) => {
    if (!confirm(`Delete "${form.title}"? This also deletes all its responses.`)) return;
    setDeleting(form._id);
    try {
      await api.delete(`/forms/${form._id}`);
      setForms((prev) => prev.filter((f) => f._id !== form._id));
      setToast({ message: 'Form deleted', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const publicUrl = (slug) => `${window.location.origin}/f/${slug}`;

  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'All Forms' : 'My Forms'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {user?.name}
            </p>
          </div>
          <Link
            to="/forms/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
            New Form
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileText size={20} className="text-indigo-500" />} label="Total Forms" value={forms.length} bg="bg-indigo-50" />
          <StatCard icon={<Users size={20} className="text-green-500" />} label="Total Responses" value={totalSubmissions} bg="bg-green-50" />
          <StatCard icon={<BarChart2 size={20} className="text-purple-500" />} label="Published" value={forms.length} bg="bg-purple-50" />
          <StatCard icon={<Edit3 size={20} className="text-amber-500" />} label="Avg Responses" value={forms.length ? Math.round(totalSubmissions / forms.length) : 0} bg="bg-amber-50" />
        </div>

        {/* Forms list */}
        {loading ? (
          <Spinner />
        ) : forms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-gray-700 font-medium mb-1">No forms yet</h2>
            <p className="text-gray-400 text-sm mb-5">Create your first form to get started</p>
            <Link
              to="/forms/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <PlusCircle size={16} />
              Create form
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form._id}
                form={form}
                publicUrl={publicUrl}
                deleting={deleting}
                onDelete={handleDelete}
                onEdit={() => navigate(`/forms/${form._id}/edit`)}
                onResponses={() => navigate(`/forms/${form._id}/responses`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function FormCard({ form, publicUrl, deleting, onDelete, onEdit, onResponses }) {
  const url = publicUrl(form.slug);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{form.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">
              v{form.version} · {new Date(form.createdAt).toLocaleDateString()}
            </span>
            {form.createdBy && (
              <span className="text-xs text-gray-400 truncate max-w-[120px]">
                by {form.createdBy.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg shrink-0">
          <Users size={12} className="text-indigo-500" />
          <span className="text-xs font-medium text-indigo-700">{form.submissionCount ?? 0}</span>
        </div>
      </div>

      <div className="text-xs text-gray-400 truncate">
        {form.fields?.length ?? 0} field{form.fields?.length !== 1 ? 's' : ''}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Edit3 size={13} /> Edit
        </button>
        <button
          onClick={onResponses}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-purple-600 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <BarChart2 size={13} /> Responses
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-green-600 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          <ExternalLink size={13} /> Open
        </a>
        <button
          onClick={() => { navigator.clipboard.writeText(url); }}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors ml-auto"
        >
          Copy link
        </button>
        <button
          onClick={() => onDelete(form)}
          disabled={deleting === form._id}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
