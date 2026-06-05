const activeSessions = new Map();

function initSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join-form', ({ formId, sessionId }) => {
      if (!formId || !sessionId) return;
      socket.join(`form:${formId}`);
      socket.formId = formId;
      socket.sessionId = sessionId;

      if (!activeSessions.has(formId)) activeSessions.set(formId, new Map());
      activeSessions.get(formId).set(sessionId, {
        sessionId,
        currentFieldIndex: 0,
        startedAt: Date.now(),
      });
    });

    socket.on('session-update', ({ formId, sessionId, currentFieldIndex }) => {
      const sessions = activeSessions.get(formId);
      if (!sessions?.has(sessionId)) return;
      const s = sessions.get(sessionId);
      s.currentFieldIndex = currentFieldIndex ?? s.currentFieldIndex;
    });

    socket.on('leave-form', ({ formId, sessionId }) => {
      const sessions = activeSessions.get(formId);
      if (sessions) {
        sessions.delete(sessionId || socket.sessionId);
        if (sessions.size === 0) activeSessions.delete(formId);
      }
      socket.leave(`form:${formId}`);
    });

    socket.on('disconnect', () => {
      if (socket.formId && socket.sessionId) {
        const sessions = activeSessions.get(socket.formId);
        if (sessions) {
          sessions.delete(socket.sessionId);
          if (sessions.size === 0) activeSessions.delete(socket.formId);
        }
      }
    });
  });

  setInterval(() => {
    activeSessions.forEach((sessions, formId) => {
      const data = {
        activeCount: sessions.size,
        sessions: Array.from(sessions.values()).map((s) => ({
          sessionId: s.sessionId.slice(0, 8),
          currentFieldIndex: s.currentFieldIndex,
          timeElapsed: Math.round((Date.now() - s.startedAt) / 1000),
        })),
      };
      io.to(`form:${formId}`).emit('live-sessions', data);
    });
  }, 5000);
}

function getActiveSessions(formId) {
  const sessions = activeSessions.get(formId);
  if (!sessions) return { activeCount: 0, sessions: [] };
  return {
    activeCount: sessions.size,
    sessions: Array.from(sessions.values()).map((s) => ({
      sessionId: s.sessionId.slice(0, 8),
      currentFieldIndex: s.currentFieldIndex,
      timeElapsed: Math.round((Date.now() - s.startedAt) / 1000),
    })),
  };
}

module.exports = { initSocket, getActiveSessions };
