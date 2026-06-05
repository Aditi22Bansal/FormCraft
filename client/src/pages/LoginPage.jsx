import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back'); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-base flex">
      <div className="hidden lg:flex flex-1 bg-surface border-r border-border items-center justify-center p-12">
        <div>
          <h1 className="text-3xl font-semibold text-text mb-3">FormCraft</h1>
          <p className="text-text-secondary max-w-sm">The form intelligence platform that understands, analyzes, and optimizes every interaction.</p>
          <div className="mt-8 w-48 h-48 rounded-full bg-accent-subtle dot-grid" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-[10px] p-10">
          <h2 className="text-xl font-semibold text-text mb-6">Sign in</h2>
          <Button variant="ghost" className="w-full mb-4" disabled>Continue with Google</Button>
          <div className="relative my-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-text-tertiary">or continue with email</span></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign in'}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">No account? <Link to="/signup" className="text-accent hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
