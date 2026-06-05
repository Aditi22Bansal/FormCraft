import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, MessageSquare, Radio, ArrowRight, ShieldAlert, Users, 
  Layers, Bot, Activity, CheckCircle2, Terminal, ArrowUpRight, Cpu, Play, Pause 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

const FEATURES = [
  { 
    icon: Sparkles, 
    title: 'AI Generation Engine', 
    desc: 'Describe your form in plain English. FormCraft compiles fields, options, and validations instantly with zero API latency.',
    badge: 'Gemini v2.0'
  },
  { 
    icon: MessageSquare, 
    title: 'Conversational Playback', 
    desc: 'Engage users with smooth, one-question-at-a-time interfaces. Proven to double completion rates for long forms.',
    badge: 'Fluid Transitions'
  },
  { 
    icon: Radio, 
    title: 'Interaction OS & Telemetry', 
    desc: 'Track rage clicks, keypress durations, backspaces, copy-pastes, and sentiment metrics in real time over WebSockets.',
    badge: 'Live Stream'
  },
];

const PRESETS = {
  'Feedback Survey': [
    { label: 'Overall Rating', type: '★ Star Rating' },
    { label: 'Feature Request Details', type: '📝 Long Text' },
    { label: 'Would you recommend us?', type: '🔘 Radio Choice' }
  ],
  'Job Application': [
    { label: 'Full Name', type: '👤 Short Text' },
    { label: 'Email Address', type: '✉️ Email' },
    { label: 'Portfolio URL', type: '🔗 URL Input' },
    { label: 'Years of Experience', type: '🔢 Number' }
  ],
  'Lead Contact': [
    { label: 'Business Name', type: '🏢 Short Text' },
    { label: 'Estimated Budget', type: '💰 Dropdown' },
    { label: 'Project Brief', type: '📝 Long Text' }
  ]
};

const STATS = [
  { num: '12+', label: 'Interaction Events Tracked' },
  { num: 'Real-Time', label: 'WebSocket Streaming' },
  { num: '100%',所在: 'Free AI Templates' },
  { num: '3-Layer', label: 'Bot Anomaly Check' },
];

const LIVE_SIMULATION_EVENTS = [
  { time: '1s ago', type: 'focus', title: 'Field Focus', detail: 'User #842 focused "Email Address"' },
  { time: '4s ago', type: 'typing', title: 'Interaction', detail: 'Rage click detected at "Portfolio URL" label' },
  { time: '8s ago', type: 'sentiment', title: 'Sentiment Analysis', detail: 'Feedback: "Form Builder is super fast!" (96% Positive)' },
  { time: '12s ago', type: 'anomaly', title: 'Anomaly Warning', detail: 'Fast submission detected. Time spent: 1.2s (Bot Likelihood: High)' },
  { time: '18s ago', type: 'submit', title: 'Form Completed', detail: 'User #319 submitted "Feedback Survey" [Quiz Score: 80%]' }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState('');
  const [activeTab, setActiveTab] = useState('Feedback Survey');
  const [simulating, setSimulating] = useState(false);
  const [simulatedFields, setSimulatedFields] = useState(PRESETS['Feedback Survey']);
  
  // Live session stream simulation states
  const [simEvents, setSimEvents] = useState(LIVE_SIMULATION_EVENTS);
  const [isPlaying, setIsPlaying] = useState(true);

  // Animate form field simulation when activeTab changes
  useEffect(() => {
    setSimulating(true);
    setSimulatedFields([]);
    const fields = PRESETS[activeTab];
    let current = [];
    
    fields.forEach((field, index) => {
      setTimeout(() => {
        current = [...current, field];
        setSimulatedFields([...current]);
        if (index === fields.length - 1) {
          setSimulating(false);
        }
      }, (index + 1) * 400);
    });
  }, [activeTab]);

  // Telemetry stream generator
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const types = ['focus', 'typing', 'sentiment', 'anomaly', 'submit'];
      const details = {
        focus: `User #${Math.floor(Math.random() * 900 + 100)} focused "${['Full Name', 'Company', 'Feedback'][Math.floor(Math.random() * 3)]}"`,
        typing: `${['Rage click', 'Paste detected', 'Fast typing'][Math.floor(Math.random() * 3)]} at field "${['Email', 'Portfolio', 'Experience'][Math.floor(Math.random() * 3)]}"`,
        sentiment: `Feedback: "${['Amazing experience!', 'Very smooth UI', 'Could be improved.'][Math.floor(Math.random() * 3)]}" (Sentiment: ${Math.floor(Math.random() * 40 + 60)}% Positive)`,
        anomaly: `Suspect speed warning: filled 5 fields in ${Math.floor(Math.random() * 3 + 1)}s`,
        submit: `Form submitted in ${Math.floor(Math.random() * 40 + 15)}s [Score: ${Math.floor(Math.random() * 40 + 60)}%]`
      };
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newEvent = {
        time: 'Just now',
        type: randomType,
        title: randomType === 'focus' ? 'Field Focus' : randomType === 'typing' ? 'Interaction' : randomType === 'sentiment' ? 'Sentiment Score' : randomType === 'anomaly' ? 'Anomaly Alert' : 'Form Submitted',
        detail: details[randomType]
      };
      
      setSimEvents((prev) => [
        newEvent,
        ...prev.map(e => e.time === 'Just now' ? { ...e, time: '2s ago' } : e.time === '2s ago' ? { ...e, time: '8s ago' } : e.time === '8s ago' ? { ...e, time: '15s ago' } : { ...e, time: '30s ago' })
      ].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStartPromptGeneration = (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    navigate(`/signup?prompt=${encodeURIComponent(promptInput)}`);
  };

  const getEventBadgeClass = (type) => {
    switch (type) {
      case 'anomaly': return 'bg-danger/10 text-danger border border-danger/20';
      case 'sentiment': return 'bg-success/10 text-success border border-success/20';
      case 'submit': return 'bg-accent/10 text-accent border border-accent/20';
      default: return 'bg-info/10 text-info border border-info/20';
    }
  };

  return (
    <div className="min-h-screen bg-base font-sans antialiased text-text select-none">
      
      {/* Premium Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-base/70 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md shadow-accent/20">F</div>
            <span className="font-semibold text-text tracking-tight flex items-center gap-1.5">
              FormCraft 
              <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono">v3.0</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-text-secondary">
            {['Features', 'Telemetry OS', 'How it Works', 'Tech Stack'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="hover:text-text transition-colors duration-150 relative py-1 group">
                {l}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="flex gap-2.5 items-center">
            {user ? (
              <Link to="/dashboard"><Button size="sm">Go to Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/signup"><Button size="sm">Get Started Free</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6366F10d_0%,transparent_65%)]" />
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/8 border border-accent/15 text-[11px] font-semibold text-accent uppercase tracking-wider"
            >
              <Sparkles size={11} /> Next-Gen Form Intelligence
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-[1.1]"
            >
              The Form Builder <br />
              <span className="bg-gradient-to-r from-accent via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                That Thinks.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl"
            >
              Instantly compile fields using AI, offer premium conversational playback, and stream user interactions in real time. FormCraft tracks user friction, flags bot inputs, and grades quiz scores automatically.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-2 max-w-lg"
            >
              <form onSubmit={handleStartPromptGeneration} className="flex gap-2 p-1.5 bg-surface border border-border/80 rounded-xl shadow-lg shadow-text/2">
                <input 
                  type="text" 
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. A job application with portfolio link..." 
                  className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-text-tertiary"
                />
                <Button type="submit" size="md">
                  Build with AI <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </form>
              <p className="text-[10px] text-text-tertiary mt-2.5 px-1.5">
                First signup gets administrative workspace access. Bypassed direct API limits for instant local demos.
              </p>
            </motion.div>
          </div>

          {/* Interactive AI Preview Simulator Panel */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-surface border border-border rounded-xl shadow-2xl p-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                  <Terminal size={13} className="text-accent" />
                  <span>AI Compiler Output</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-1 bg-elevated p-1 rounded-lg text-xs font-semibold mb-4">
                {Object.keys(PRESETS).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => !simulating && setActiveTab(tab)}
                    disabled={simulating}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                      activeTab === tab ? 'bg-surface text-text shadow-sm' : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {tab.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Simulated Form Field Area */}
              <div className="min-h-[160px] space-y-2 border border-dashed border-border rounded-lg p-3 bg-base/50 flex flex-col justify-center">
                <AnimatePresence mode="popLayout">
                  {simulatedFields.length === 0 && (
                    <div className="text-center py-8 text-xs text-text-tertiary animate-pulse">
                      Generating structure...
                    </div>
                  )}
                  {simulatedFields.map((f, i) => (
                    <motion.div 
                      key={f.label}
                      initial={{ opacity: 0, x: -10, y: 5 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-between p-2.5 bg-surface border border-border rounded-lg shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text">{f.label}</span>
                        <span className="text-[9px] text-text-tertiary mt-0.5">Field #{i + 1}</span>
                      </div>
                      <span className="text-[10px] font-mono text-accent bg-accent-subtle px-2 py-0.5 rounded font-semibold border border-accent/10">
                        {f.type}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3.5 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Compilation latency: <span className="font-semibold text-text">800ms (Static Fallback)</span></span>
                <Button size="sm" onClick={() => navigate(`/signup?preset=${activeTab}`)}>Create Form</Button>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Hero Laptop Image Mockup */}
        <div className="max-w-5xl mx-auto px-6 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring', damping: 20 }}
            className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-surface group"
          >
            {/* Browser Header Chrome */}
            <div className="h-10 bg-elevated border-b border-border/80 flex items-center px-4 justify-between">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-danger/25 group-hover:bg-danger transition-colors duration-150" />
                <span className="w-3 h-3 rounded-full bg-warning/25 group-hover:bg-warning transition-colors duration-150" />
                <span className="w-3 h-3 rounded-full bg-success/25 group-hover:bg-success transition-colors duration-150" />
              </div>
              <div className="w-96 h-6 bg-surface border border-border/60 rounded-md text-[10px] font-mono text-text-tertiary flex items-center justify-center">
                formcraft.io/dashboard/workspace
              </div>
              <div className="w-10" />
            </div>
            {/* The Image */}
            <img 
              src="/hero_mockup.png" 
              alt="FormCraft Workspace Builder Dashboard Mockup" 
              className="w-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-[1.01]" 
            />
          </motion.div>
        </div>
      </section>

      {/* Product Stats Bar */}
      <section className="bg-surface border-y border-border/80">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/40">
          {STATS.map(({ num, label }) => (
            <div key={label} className="first:border-none border-l border-border/40 flex flex-col justify-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">{num}</p>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] font-bold text-accent uppercase tracking-wider px-2.5 py-1 bg-accent-subtle rounded-full border border-accent/15">SaaS OS Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">Three Pillars of Form Intelligence</h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            FormCraft is built to replace legacy Google Forms & Typeforms with deep interaction analytics and responsive automation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, badge }) => (
            <motion.div 
              key={title} 
              whileHover={{ y: -6 }}
              className="bg-surface border border-border rounded-xl p-6 transition-all shadow-sm hover:shadow-xl hover:border-accent/30 relative flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-accent-subtle rounded-xl flex items-center justify-center mb-5 border border-accent/10">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                  {title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{desc}</p>
              </div>
              <span className="text-[10px] font-semibold text-text-tertiary bg-elevated px-2 py-0.5 rounded self-start border border-border/40">
                {badge}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Telemetry Stream & Interaction OS Section */}
      <section id="telemetry-os" className="bg-surface border-y border-border/80 py-24 scroll-mt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#6366F105_0%,transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Live Simulator Widget */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-base border border-border rounded-xl p-5 shadow-lg relative overflow-hidden">
              
              <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-text">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span>Live Event Telemetry Stream</span>
                </div>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 hover:bg-elevated rounded transition-colors text-text-secondary hover:text-text cursor-pointer"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
              </div>

              {/* Event Stack */}
              <div className="space-y-2.5 max-h-[260px] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {simEvents.map((evt) => (
                    <motion.div 
                      key={evt.detail}
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.3 }}
                      className="p-2.5 bg-surface border border-border rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold font-mono ${getEventBadgeClass(evt.type)}`}>
                          {evt.title}
                        </span>
                        <span className="text-text-secondary text-[11px] truncate max-w-[260px] sm:max-w-xs">{evt.detail}</span>
                      </div>
                      <span className="text-[10px] text-text-tertiary font-mono font-medium">{evt.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80 text-[10px] text-text-tertiary flex items-center gap-2">
                <Terminal size={11} className="text-accent" />
                <span>WebSocket subscription active: listening for focus, blur, copy, paste, click, and exit actions.</span>
              </div>

            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider px-2.5 py-1 bg-accent-subtle rounded-full border border-accent/15">Interaction OS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight leading-tight">
              Analyze user behavior <br />
              before they press submit.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Standard form builders only show you completed responses. FormCraft captures telemetry events to map where drop-off happens, analyze input speed patterns, and detect anomalies.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-accent-subtle rounded-full flex items-center justify-center border border-accent/10 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                </div>
                <p className="text-sm font-medium text-text">
                  <span className="font-semibold">Drop-off Friction Mapping:</span> Understand exactly which field is causing respondents to exit your site.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-accent-subtle rounded-full flex items-center justify-center border border-accent/10 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                </div>
                <p className="text-sm font-medium text-text">
                  <span className="font-semibold">AI Sentiment Grader:</span> Real-time sentiment evaluation on long text inputs using custom parsing.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Analytics & Layout Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider px-2.5 py-1 bg-accent-subtle rounded-full border border-accent/15">How it Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">Full-Stack Form Operations</h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              FormCraft is a complete B2B SaaS platform that supports draft versioning, rapid restoration, scoring parameters, and widget embeddings.
            </p>

            <div className="space-y-4">
              {[
                { step: '01', title: 'Generate & Customize', text: 'Build using drag-and-drop elements or prompt the Gemini compiler to configure validation constraints and color preferences.' },
                { step: '02', title: 'Deploy / Embed widget', text: 'Inject our widget code into any external HTML site or share standard links supporting either Classic or Conversational view modes.' },
                { step: '03', title: 'Analyze Diagnostics', text: 'Monitor response stats, download CSV sheets, comment on submissions, or look at anomaly scores in your analytics dashboard.' }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-xl border border-border/60 hover:bg-surface hover:border-accent/10 transition-all">
                  <span className="text-lg font-bold text-accent/30 font-mono mt-0.5">{item.step}</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-text">{item.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-xl border border-border shadow-2xl overflow-hidden bg-surface group"
            >
              {/* Browser chrome Header */}
              <div className="h-10 bg-elevated border-b border-border/80 flex items-center px-4 justify-between">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-danger/25" />
                  <span className="w-3 h-3 rounded-full bg-warning/25" />
                  <span className="w-3 h-3 rounded-full bg-success/25" />
                </div>
                <div className="w-72 h-6 bg-surface border border-border/60 rounded-md text-[10px] font-mono text-text-tertiary flex items-center justify-center">
                  formcraft.io/analytics/chart
                </div>
                <div className="w-10" />
              </div>
              
              <img 
                src="/analytics_preview.png" 
                alt="Interaction Analytics Chart Preview" 
                className="w-full object-cover select-none pointer-events-none group-hover:scale-[1.01] transition-transform duration-700" 
              />
              
              {/* Floating widgets overlays */}
              <div className="absolute top-16 right-4 bg-surface border border-border rounded-lg p-2.5 shadow-lg text-[10px] max-w-[150px] space-y-1 backdrop-blur-md bg-surface/90">
                <div className="flex items-center gap-1 text-success font-semibold">
                  <CheckCircle2 size={11} />
                  <span>Completion Rate</span>
                </div>
                <p className="text-xs font-bold text-text">92.4% Average</p>
                <span className="text-[9px] text-text-tertiary">+12.3% this week</span>
              </div>

              <div className="absolute bottom-6 left-4 bg-surface border border-border rounded-lg p-2.5 shadow-lg text-[10px] max-w-[150px] space-y-1 backdrop-blur-md bg-surface/90">
                <div className="flex items-center gap-1 text-danger font-semibold">
                  <ShieldAlert size={11} />
                  <span>Avg Anomaly Flag</span>
                </div>
                <p className="text-xs font-bold text-text">1.8% flagged</p>
                <span className="text-[9px] text-text-tertiary">Mostly fast typing bots</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Tech Stack Card Section */}
      <section id="tech-stack" className="bg-surface border-y border-border/80 py-20 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-4">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider px-2.5 py-1 bg-accent-subtle rounded-full border border-accent/15">SaaS OS Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">Built on the Modern Full-Stack</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Engineered with production-grade tools to demonstrate high performance, WebSockets latency sync, and structured AI prompt piping.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { title: 'React', desc: 'Frontend Framework', cat: 'UI Engine' },
              { title: 'Framer Motion', desc: 'Hardware accelerated', cat: 'Animations' },
              { title: 'Node & Express', desc: 'Asynchronous APIs', cat: 'Server API' },
              { title: 'MongoDB', desc: 'Document schemas', cat: 'Database' },
              { title: 'Socket.io', desc: 'WebSocket sync', cat: 'Real-time OS' },
              { title: 'Gemini AI', desc: 'Local static templates', cat: 'AI compiler' }
            ].map((t) => (
              <div key={t.title} className="p-4 bg-base border border-border/70 rounded-xl hover:border-accent/20 transition-all text-center space-y-1">
                <span className="text-[9px] font-bold text-accent uppercase tracking-wider bg-accent-subtle px-2 py-0.5 rounded border border-accent/10">{t.cat}</span>
                <h4 className="text-sm font-bold text-text pt-2">{t.title}</h4>
                <p className="text-[10px] text-text-secondary leading-normal">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-tr from-accent to-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff1a_0%,transparent_60%)]" />
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Deploy your next-gen form today.</h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Create an account instantly. Use AI to construct quiz metrics or conversational templates and stream interactions live.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/signup"><Button variant="ghost" size="lg" className="bg-white text-accent border-none hover:bg-white/90">Get Started Free</Button></Link>
              <Link to="/login"><Button variant="ghost" size="lg" className="bg-transparent text-white border-white/30 hover:bg-white/10">Sign in</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 py-10 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-white text-[10px] font-bold">F</div>
          <span className="font-semibold text-text text-sm">FormCraft</span>
        </div>
        <p className="text-xs text-text-tertiary">
          © 2026 FormCraft. Designed for portfolio demonstration. Powered by MongoDB, WebSockets, & Gemini AI.
        </p>
      </footer>

    </div>
  );
}
