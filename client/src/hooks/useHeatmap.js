import { useRef, useCallback, useEffect } from 'react';

export function useHeatmap(formId, sessionId) {
  const events = useRef([]);
  const focusTimes = useRef({});

  const flush = useCallback(() => {
    if (!events.current.length || !formId) return;
    const payload = JSON.stringify({ sessionId, events: events.current });
    events.current = [];
    navigator.sendBeacon(`/api/track/${formId}`, new Blob([payload], { type: 'application/json' }));
  }, [formId, sessionId]);

  const track = useCallback((type, data = {}) => {
    events.current.push({ type, ...data, timestamp: new Date().toISOString() });
    if (events.current.length >= 10) flush();
  }, [flush]);

  const onFocus = useCallback((fieldId) => {
    focusTimes.current[fieldId] = Date.now();
    track('focus', { fieldId });
  }, [track]);

  const onBlur = useCallback((fieldId, value) => {
    const spent = focusTimes.current[fieldId] ? Date.now() - focusTimes.current[fieldId] : 0;
    track('blur', { fieldId, timeSpent: Math.round(spent / 1000) });
    if (!value || value === '' || (Array.isArray(value) && !value.length)) track('abandon', { fieldId });
  }, [track]);

  const onClick = useCallback((fieldId, x, y) => track('click', { fieldId, x, y }), [track]);

  useEffect(() => {
    const id = setInterval(flush, 3000);
    const handler = () => flush();
    window.addEventListener('beforeunload', handler);
    return () => { clearInterval(id); window.removeEventListener('beforeunload', handler); flush(); };
  }, [flush]);

  return { onFocus, onBlur, onClick };
}
