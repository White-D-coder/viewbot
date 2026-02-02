# ViewBot (Backend Version)

This is a Puppeteer-based script to automate YouTube views using proxies.

## Setup

1.  **Install Dependencies:**
    ```bash
    cd bot
    npm install
    ```

2.  **Add Proxies:**
    Open `proxies.txt` and add your proxies (one per line). Supported formats:
    -   `ip:port`
    -   `ip:port:user:pass`
    -   `http://user:pass@ip:port`

    > **Note:** If `proxies.txt` is empty, it will run ONCE using your local IP (for testing).

## Usage

Run the bot with a target video URL:

```bash
node index.js "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

## Configuration
You can edit `index.js` to change:
-   `CONCURRENCY`: Number of concurrent browsers (Default: 5).
-   `VIEW_DURATION`: Time to watch in milliseconds (Default: 1-3 mins).
