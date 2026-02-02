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
    allowDirectFallback: false
};
