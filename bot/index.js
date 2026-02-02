import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const TARGET_URL = process.argv[2];
const CONCURRENCY = 10; // Max concurrent browsers
const VIEW_DURATION = [60000, 180000]; // 1 min to 3 min

if (!TARGET_URL) {
    console.error(chalk.red('Please provide a YouTube URL.'));
    console.log(chalk.gray('Usage: node index.js <VIDEO_URL_OR_CHANNEL_URL>'));
    process.exit(1);
}

// Global Video Pool
let videoPool = [];

// Helper: Check if URL is channel
function isChannelUrl(url) {
    return url.includes('/channel/') || url.includes('/c/') || url.includes('/@') || url.includes('/user/');
}

// Helper: Scrape videos from channel
async function scrapeChannelVideos(url) {
    console.log(chalk.yellow(`Detecting Channel URL. Scraping videos from: ${url}`));
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        let videosUrl = url;
        if (!url.includes('/videos')) {
            videosUrl = url.replace(/\/$/, '') + '/videos';
        }

        await page.goto(videosUrl, { waitUntil: 'networkidle2' });

        // Extract video IDs
        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a#video-title-link'));
            return anchors.map(a => a.href).filter(href => href.includes('/watch?v='));
        });

        const uniqueLinks = [...new Set(links)];
        console.log(chalk.green(`Found ${uniqueLinks.length} videos.`));
        return uniqueLinks;

    } catch (e) {
        console.error(chalk.red('Failed to scrape channel:', e.message));
        return [];
    } finally {
        await browser.close();
    }
}

// Load Proxies
let proxies = [];
try {
    const data = fs.readFileSync('proxies.txt', 'utf8');
    proxies = data.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
} catch (e) {
    console.error(chalk.red('Could not read proxies.txt'));
    process.exit(1);
}

if (proxies.length === 0) {
    console.warn(chalk.yellow('WARNING: No proxies found. Using direct connection (risky).'));
    proxies.push(null);
}

async function runBrowser(proxy, id, targetVideo) {
    const log = (msg) => console.log(chalk.magenta(`[Bot ${id}]`) + ' ' + msg);

    let launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,720',
        '--mute-audio',
        '--autoplay-policy=no-user-gesture-required',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list'
    ];

    let username, password;

    if (proxy) {
        if (proxy.includes('@')) {
            launchArgs.push(`--proxy-server=${proxy}`);
        } else if (proxy.split(':').length === 4) {
            const parts = proxy.split(':');
            launchArgs.push(`--proxy-server=${parts[0]}:${parts[1]}`);
            username = parts[2];
            password = parts[3];
        } else {
            launchArgs.push(`--proxy-server=${proxy}`);
        }
    }

    // Determine target
    let finalUrl = targetVideo;
    // If pool exists, pick random if not provided (re-roll logic could go here)
    if (videoPool.length > 0) {
        finalUrl = videoPool[Math.floor(Math.random() * videoPool.length)];
    }

    log(`Target: ${finalUrl.substring(finalUrl.length - 11)} | Proxy: ${proxy ? 'YES' : 'NO'}`);

    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            ignoreHTTPSErrors: true,
            args: launchArgs
        });

        const page = await browser.newPage();

        // Stealth
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        if (username && password) await page.authenticate({ username, password });

        // Optimization
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'font'].includes(req.resourceType())) req.abort();
            else req.continue();
        });

        await page.goto(finalUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Playback logic
        const duration = Math.floor(Math.random() * (VIEW_DURATION[1] - VIEW_DURATION[0])) + VIEW_DURATION[0];
        log(`Watching for ${Math.floor(duration / 1000)}s...`);

        // Simulate activity
        setTimeout(() => page.mouse.move(200, 200).catch(() => { }), 5000);

        await new Promise(r => setTimeout(r, duration));
        log('View Complete.');

    } catch (e) {
        log(chalk.red(`Error: ${e.message}`));
    } finally {
        if (browser) await browser.close();
    }
}

async function startQueue() {
    // 1. Prepare Video Pool
    if (isChannelUrl(TARGET_URL)) {
        videoPool = await scrapeChannelVideos(TARGET_URL);
        if (videoPool.length === 0) {
            console.error(chalk.red('No videos found in channel. Exiting.'));
            process.exit(1);
        }
    } else {
        videoPool = [TARGET_URL];
    }

    console.log(chalk.blue(`Starting Swarm with ${proxies.length} proxies across ${videoPool.length} videos.`));

    // 2. Start Workers
    let active = 0;
    let index = 0;

    const next = () => {
        if (index >= proxies.length) return;

        if (active < CONCURRENCY) {
            const p = proxies[index];
            const i = index;
            index++;
            active++;

            // Pick random video for this bot instance
            const randomVideo = videoPool[Math.floor(Math.random() * videoPool.length)];

            runBrowser(p, i + 1, randomVideo).then(() => {
                active--;
                if (index < proxies.length) next();
                else if (active === 0) console.log(chalk.green('All bots finished.'));
            });
            next();
        }
    };

    next();
}

startQueue();
