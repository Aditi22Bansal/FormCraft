import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';

export function useLiveSessions(formId) {
  const [sessions, setSessions] = useState({ activeCount: 0, sessions: [] });

  useEffect(() => {
    if (!formId) return;
    const socket = getSocket();
    socket.emit('join-form', { formId, sessionId: `owner-${formId}` });
    const handler = (data) => setSessions(data);
    socket.on('live-sessions', handler);
    return () => {
      socket.off('live-sessions', handler);
      socket.emit('leave-form', { formId, sessionId: `owner-${formId}` });
    };
  }, [formId]);

  return sessions;
}

export function useFormSession(formId) {
  useEffect(() => {
    if (!formId) return;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const socket = getSocket();
    socket.emit('join-form', { formId, sessionId });
    return () => socket.emit('leave-form', { formId, sessionId });
  }, [formId]);
}
