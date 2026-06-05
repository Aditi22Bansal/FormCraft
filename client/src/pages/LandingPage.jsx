import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, Radio, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const FEATURES = [
  { icon: Sparkles, title: 'AI Generation', desc: 'Describe your form in plain English. Gemini builds it instantly with smart field types and validation.' },
  { icon: MessageSquare, title: 'Conversational Mode', desc: 'One question at a time with smooth transitions — higher completion rates.' },
  { icon: Radio, title: 'Real-Time Intelligence', desc: 'Live sessions, heatmaps, anomaly detection, and sentiment analysis on every response.' },
];

const STATS = [
  { num: '10+', label: 'Event Types Tracked' },
  { num: 'Live', label: 'Real-Time Sessions' },
  { num: '5', label: 'Metric Health Score' },
  { num: '3-Layer', label: 'Anomaly Detection' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base">
      <header className="fixed top-0 inset-x-0 z-30 bg-base/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-text">FormCraft</span>
          <nav className="hidden md:flex gap-8 text-sm text-text-secondary">
            {['Features', 'How it Works', 'Pricing'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-text transition-colors duration-150">{l}</a>
            ))}
          </nav>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-24 overflow-hidden dot-grid">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6366F108_0%,transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="text-5xl font-semibold text-text leading-tight mb-6">
            The form builder that <span className="text-accent">thinks.</span>
          </motion.h1>
          <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
            Build smarter forms with AI, collect responses conversationally, and analyze every interaction in real time.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/signup"><Button size="lg">Get Started Free <ArrowRight size={16} className="ml-2" /></Button></Link>
            <Button variant="ghost" size="lg">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-4 border-y border-border">
        <p className="text-center text-xs text-text-tertiary mb-4">Trusted by 500+ teams</p>
        <div className="flex justify-center gap-8 opacity-30">
          {['Acme', 'Nova', 'Pulse', 'Orbit', 'Flux'].map((n) => (
            <span key={n} className="text-sm font-semibold text-text-secondary">{n}</span>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface border border-border rounded-[10px] p-6">
              <div className="w-10 h-10 bg-accent-subtle rounded-lg flex items-center justify-center mb-4">
                <Icon size={18} className="text-accent" />
              </div>
              <h3 className="font-semibold text-text mb-2">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-surface border-y border-border py-20">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          {['Create', 'Share', 'Analyze'].map((step, i) => (
            <div key={step}>
              <span className="text-2xl font-semibold text-accent/30">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-semibold text-text mt-2">{step}</h3>
              <p className="text-sm text-text-secondary mt-1">
                {i === 0 ? 'Build with drag-and-drop or AI' : i === 1 ? 'Share your unique form link' : 'Track intelligence in real time'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map(({ num, label }) => (
          <div key={label}>
            <p className="text-2xl font-semibold text-accent">{num}</p>
            <p className="text-xs text-text-secondary mt-1">{label}</p>
          </div>
        ))}
      </section>

      <section className="text-center py-20 px-6">
        <h2 className="text-2xl font-semibold text-text mb-4">Start building smarter forms</h2>
        <Link to="/signup"><Button size="lg">Get Started</Button></Link>
      </section>

      <footer className="border-t border-border py-8 px-6 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-semibold text-text text-sm">FormCraft</span>
        <p className="text-xs text-text-tertiary">© 2026 FormCraft</p>
      </footer>
    </div>
  );
}
