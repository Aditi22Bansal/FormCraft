const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const publicRoutes = require('./routes/public');
const trackRoutes = require('./routes/track');
const responseRoutes = require('./routes/responses');
const { initSocket } = require('./socket/sessionTracker');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.set('trust proxy', 1);

app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/api/diagnostics', (_req, res) => {
  const mongoStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateVal = mongoose.connection.readyState;
  res.json({
    success: true,
    data: {
      mongo: mongoStates[stateVal] || 'Unknown',
      gemini: process.env.GEMINI_API_KEY ? 'Configured' : 'Missing',
      openrouter: process.env.OPENROUTER_API_KEY ? 'Configured' : 'Missing',
      nodeVersion: process.version,
      platform: process.platform,
      memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      uptime: `${Math.round(process.uptime())}s`
    }
  });
});
app.get('/widget.js', (_req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/f', publicRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/responses', responseRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, data: null, message: 'Internal server error' });
});

initSocket(io);

const start = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/formcraft';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    console.log(`Gemini API: ${geminiKey ? `configured (${geminiKey.slice(0, 6)}...)` : 'NOT configured — add GEMINI_API_KEY to server/.env'}`);
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
};

start();
