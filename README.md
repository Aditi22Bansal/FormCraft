# FormCraft — Form Intelligence Operating System

A full-stack form platform with AI generation, real-time session tracking, interaction heatmaps, anomaly detection, sentiment analysis, and adaptive follow-up questions.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, dnd-kit, Recharts, Framer Motion, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini API |
| Auth | JWT + bcrypt |

## Quick Start

```bash
# Server
cd server
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm install && npm run dev    # :5000

# Client
cd client
npm install && npm run dev    # :5173
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `PORT` | Server port (default 5000) |

## Features

- **Dark premium UI** — Linear/Vercel-inspired design system
- **AI Form Generation** — Gemini-powered form builder
- **Conversational Mode** — one-question-at-a-time with slide transitions
- **Interaction Heatmap** — click/focus/abandon tracking via sendBeacon
- **Live Session Tracker** — WebSocket real-time active respondents
- **Anomaly Detection** — bot speed, duplicate IP, gibberish, duplicate answers
- **Form Health Score** — algorithmic score with improvement suggestions
- **Sentiment Analysis** — per-field sentiment on text responses
- **Journey Timeline** — field-level interaction log per submission
- **Adaptive Follow-Up** — Gemini generates post-submission questions
- **Quiz Mode** — timed forms with scoring
- **Embeddable Widget** — `<script src="/widget.js" data-form-id="slug">`

## API Routes

All responses: `{ success, data, message }`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/forms` | List forms |
| POST | `/api/forms/generate-ai` | AI form generation |
| GET | `/api/forms/:id/analytics` | Full analytics |
| GET | `/api/forms/:id/health-score` | Health score |
| POST | `/api/track/:formId` | Heatmap events |
| GET | `/api/f/:slug` | Public form |
| POST | `/api/f/:slug/submit` | Submit response |
| POST | `/api/f/:slug/followup` | Follow-up answers |
| GET | `/widget.js` | Embeddable SDK |

## Project Structure

```
formcraft/
├── client/src/
│   ├── components/  builder/, analytics/, public/, dashboard/, ui/
│   ├── pages/
│   ├── hooks/       useHeatmap, useJourney, useSocket
│   └── lib/           api.js, socket.js
└── server/
    ├── controllers/
    ├── models/
    ├── services/    gemini, sentiment, anomaly, healthScore
    ├── socket/      sessionTracker.js
    └── public/      widget.js
```
