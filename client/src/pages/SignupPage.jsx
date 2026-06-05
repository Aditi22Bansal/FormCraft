import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try { 
      await signup(form.name, form.email, form.password); 
      toast.success('Welcome! Workspace created.'); 
      navigate('/dashboard'); 
    } catch (err) { 
      toast.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-base flex">
      {/* Decorative left sidebar */}
      <div className="hidden lg:flex flex-1 bg-surface border-r border-border items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6366F108_0%,transparent_70%)]" />
        
        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={40} className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight text-text">FormCraft</span>
          </div>
          
          <p className="text-text-secondary text-sm leading-relaxed">
            The next-generation B2B Form Intelligence OS. Build, deploy, and analyze user interactions with instant Gemini AI structure generation.
          </p>

          {/* Mini Telemetry Simulation Widget */}
          <div className="bg-base border border-border rounded-xl p-5 shadow-sm space-y-4 font-sans select-none">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                Live Telemetry OS
              </span>
              <span className="text-[10px] text-text-tertiary">v3.0 active</span>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs p-2 bg-surface border border-border rounded-lg">
                <span className="text-text-secondary font-medium font-sans">Session Completion Rate</span>
                <span className="font-bold text-success font-sans">92.4%</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-surface border border-border rounded-lg">
                <span className="text-text-secondary font-medium font-sans">WebSocket Event Stream</span>
                <span className="font-bold text-accent font-sans">Connected</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-surface border border-border rounded-lg">
                <span className="text-text-secondary font-medium font-sans">AI Form Compiler Fallback</span>
                <span className="font-bold text-text-secondary font-sans font-medium">Ready (800ms)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-xl p-10 shadow-lg">
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <Logo size={32} className="w-8 h-8" />
            <span className="font-bold text-text text-lg">FormCraft</span>
          </div>
          
          <h2 className="text-xl font-bold text-text mb-1">Create account</h2>
          <p className="text-xs text-text-secondary mb-6">Register below. First signup gets administrative workspace access.</p>
          
          <Button variant="ghost" className="w-full mb-4 cursor-not-allowed" disabled>Continue with Google</Button>
          
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-text-tertiary">or register with email</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating account…' : 'Create account'}</Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-text-secondary">
            Have an account? <Link to="/login" className="text-accent hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
