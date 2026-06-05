import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function HealthScore({ score = 0, suggestions = [] }) {
  const [display, setDisplay] = useState(0);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (display / 100) * circumference;

  useEffect(() => {
    let frame;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / 1200, 1);
      setDisplay(Math.round(score * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="bg-surface border border-border rounded-[10px] p-6 flex gap-6 items-center">
      <div className="relative w-32 h-32 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#2A2A38" strokeWidth="8" />
          <motion.circle cx="60" cy="60" r="54" fill="none" stroke="#7C6FCD" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text">{display}</span>
          <span className="text-[11px] text-text-tertiary uppercase tracking-wider">Health</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-text mb-2">Form Health Score</h3>
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-warning/10 text-warning border border-warning/20">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Your form is performing well.</p>
        )}
      </div>
    </div>
  );
}
