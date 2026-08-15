# NOCTURNE — Production-ready foundation

A real-time multiplayer Mafia game foundation.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env`
3. Add a PostgreSQL `DATABASE_URL` when you want persistence.
4. `npm run dev`

Frontend: http://localhost:5173
Server: http://localhost:3001/health

## Architecture
- React/Vite client
- Node/Express + Socket.IO real-time server
- Prisma + PostgreSQL schema for users, games and results
- Redis is intended for live room state when scaling beyond one server

## Production
Deploy the client to Vercel and the Socket.IO server to Railway/Render/Fly.io. Use managed PostgreSQL (Neon/Supabase) and managed Redis (Upstash). Set `VITE_SERVER_URL` to the public socket server URL.

## Security
Roles are assigned on the server and are not broadcast to other players. For production, keep all action validation and win-condition resolution server-side.
