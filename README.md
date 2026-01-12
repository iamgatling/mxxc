# Mxxc (P2P File Transfer)

Mxxc is a secure, peer-to-peer file transfer application that sends files directly between browsers using WebRTC, without storing them on any server.

## Features
- **P2P Transfer**: Unlimited file size, direct device-to-device.
- **Privacy Focused**: No intermediate storage.
- **Secure**: Uses WebRTC Data Channels.
- **Modern UI**: Dark mode, glassmorphism design.

## Project Structure
- `/client`: Frontend (React + Vite + Tailwind + Socket.io-client + Simple-peer)
- `/server`: Signaling Server (Node.js + Socket.io)

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### 1. Start the Signaling Server
The server handles the initial handshake between peers.

```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:3001
```

### 2. Start the Client
The frontend application.

```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### Configuration

#### Server (.env)
Create a `.env` file in the `server` directory:
```env
PORT=3001
CLIENT_URL=http://localhost:5173  # Allowed CORS origin
```

#### Client (.env)
Create a `.env` file in the `client` directory:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Usage
1. Open the client in two different tabs or windows.
2. In Tab A: Click **Start Sending** to create a room.
3. In Tab B: Enter the **Room Code** from Tab A and click **Join**.
4. Once connected, drop a file in Tab A and click **Send**.
5. Watch the high-speed transfer in real-time!

## Deployment
- **Server**: Deploy to any Node.js host (Render, Railway, Heroku).
- **Client**: Deploy to any static host (Vercel, Netlify). Set `VITE_SERVER_URL` environment variable to your deployed server URL.
