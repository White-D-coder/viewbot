// Bot Configuration
// Edit this file to tune performance.

export default {
    // Number of browsers to run at once.
    // WARNING: Higher than 6 may cause lag on laptops. 100+ requires a server.
    concurrency: 6,

    // How long to watch a video (in milliseconds) [min, max]
    // Current: 40 seconds to 1 minute
    viewDuration: [40000, 60000],

    // How many times to retry proxies before giving up
    maxRetries: 50,

    // Browser Window Size (Smaller = Less CPU/RAM)
    windowSize: [800, 600],

    // Mute Audio? (true = better performance)
    muteAudio: true,

    // Block heavy resources? (true = much faster)
    blockResources: true,

    // SAFETY: Allow Direct Connection if proxies fail?
    // FALSE = Safer (Protects your IP, but bot stops if proxies die)
    // TRUE = Risky (Exposes your IP, but keeps running)
    allowDirectFallback: false,

    // QUALITY: Spoof Traffic Sources
    referrers: [
        'https://www.google.com/',
        'https://www.bing.com/',
        'https://search.yahoo.com/',
        'https://www.twitter.com/',
        'https://www.facebook.com/',
        'https://www.reddit.com/',
        'https://www.youtube.com/' // Internal traffic
    ],

    // QUALITY: Diverse Browsers (User Agents)
    userAgents: [
        // Windows Chrome
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        // Mac Chrome
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Windows Edge
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        // Mac Safari
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        // Windows Firefox
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
    ]
};
