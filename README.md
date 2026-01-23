# Multi-ViewBot

A simulator for watching a YouTube video across 30 different "instances" concurrently.

## Features
- **30 Concurrent Players**: Simulates a video wall.
- **Auto-Replay**: Each player automatically restarts the video when it ends to simulate a new view.
- **Simulated Identity**: Each player displays a random "User Agent" name to mimic different accounts.
- **Status Indicators**: Visual feedback for active nodes.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

4. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`) and click **START**.
