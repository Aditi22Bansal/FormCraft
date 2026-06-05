import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try { await signup(form.name, form.email, form.password); toast.success('Account created'); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-base flex">
      <div className="hidden lg:flex flex-1 bg-surface border-r border-border items-center justify-center p-12">
        <div>
          <h1 className="text-3xl font-semibold text-text mb-3">FormCraft</h1>
          <p className="text-text-secondary max-w-sm">Build forms that think. First signup gets Admin access.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-[10px] p-10">
          <h2 className="text-xl font-semibold text-text mb-6">Create account</h2>
          <Button variant="ghost" className="w-full mb-4" disabled>Continue with Google</Button>
          <div className="relative my-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-text-tertiary">or continue with email</span></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating…' : 'Create account'}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">Have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
