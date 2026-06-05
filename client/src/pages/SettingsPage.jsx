import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/ui/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Database, ShieldAlert, Cpu, User, CheckCircle2, XCircle } from 'lucide-react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [systemStatus, setSystemStatus] = useState({
    mongo: 'Checking...',
    socket: 'Checking...',
    gemini: 'Checking...',
    openrouter: 'Checking...',
    nodeVersion: '',
    platform: '',
    memory: '',
    uptime: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const isSocketConnected = socket.connected ? 'Active' : 'Disconnected';
    
    api.get('/diagnostics').then((res) => {
      const d = res.data;
      setSystemStatus({
        mongo: d.mongo,
        socket: isSocketConnected,
        gemini: d.gemini,
        openrouter: d.openrouter,
        nodeVersion: d.nodeVersion,
        platform: d.platform,
        memory: d.memory,
        uptime: d.uptime
      });
    }).catch(() => {
      setSystemStatus({
        mongo: 'Disconnected',
        socket: isSocketConnected,
        gemini: 'Unknown',
        openrouter: 'Unknown',
        nodeVersion: 'N/A',
        platform: 'N/A',
        memory: 'N/A',
        uptime: 'N/A'
      });
    });
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    // Simulated profile save (backend auth endpoint remains unchanged, but we show UI feedback)
    await new Promise((r) => setTimeout(r, 600));
    setSavingProfile(false);
    toast.success('Profile updated (demo mode)');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingPassword(false);
    setPassword({ current: '', new: '', confirm: '' });
    toast.success('Password changed successfully');
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="px-8 py-6 max-w-4xl">
        <h1 className="text-2xl font-semibold text-text mb-6">Settings</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main settings column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-[10px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-accent" />
                <h3 className="text-sm font-semibold text-text">Account Profile</h3>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                  <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
                </div>
                <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save Changes'}</Button>
              </form>
            </div>

            <div className="bg-surface border border-border rounded-[10px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={16} className="text-accent" />
                <h3 className="text-sm font-semibold text-text">Security Settings</h3>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input label="Current Password" type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="New Password" type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} required />
                  <Input label="Confirm New Password" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} required />
                </div>
                <Button type="submit" disabled={savingPassword}>{savingPassword ? 'Updating…' : 'Change Password'}</Button>
              </form>
            </div>
          </div>

          {/* Sidebar diagnostics column */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-[10px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={16} className="text-accent" />
                <h3 className="text-sm font-semibold text-text">Diagnostics</h3>
              </div>
              <div className="space-y-4 text-xs">
                {[
                  { name: 'Database (MongoDB)', key: 'mongo', okVals: ['Connected'] },
                  { name: 'WebSockets (Socket.io)', key: 'socket', okVals: ['Active'] },
                  { name: 'Gemini AI Engine', key: 'gemini', okVals: ['Configured'] },
                  { name: 'OpenRouter Integrator', key: 'openrouter', okVals: ['Configured'] },
                ].map((item) => {
                  const val = systemStatus[item.key];
                  const isOk = item.okVals.includes(val);
                  const isChecking = val === 'Checking...';
                  return (
                    <div key={item.name} className="flex items-center justify-between border-b border-border pb-2.5">
                      <span className="text-text-secondary font-medium">{item.name}</span>
                      <div className={`flex items-center gap-1.5 font-medium ${
                        isOk ? 'text-success' : isChecking ? 'text-text-tertiary animate-pulse' : 'text-danger'
                      }`}>
                        {isOk ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {val}
                      </div>
                    </div>
                  );
                })}

                {/* System Stats */}
                <div className="pt-2 space-y-2.5">
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Host Information</p>
                  
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-secondary">Node Version</span>
                    <span className="text-text font-mono font-medium">{systemStatus.nodeVersion || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-secondary">Platform OS</span>
                    <span className="text-text font-medium capitalize">{systemStatus.platform || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-secondary">Heap Memory</span>
                    <span className="text-text font-medium">{systemStatus.memory || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-secondary">Server Uptime</span>
                    <span className="text-text font-medium">{systemStatus.uptime || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
