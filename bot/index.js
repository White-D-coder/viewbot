import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chalk from 'chalk';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const TARGET_URL = process.argv[2];
const CONCURRENCY = 5; // How many browsers at once
const VIEW_DURATION = [60000, 180000]; // 1 min to 3 min

if (!TARGET_URL) {
    console.error(chalk.red('Please provide a YouTube URL.'));
    console.log(chalk.gray('Usage: node index.js <URL>'));
    process.exit(1);
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
    console.log(chalk.yellow('Creating empty proxies.txt...'));
    fs.writeFileSync('proxies.txt', '# Add proxies here (ip:port:user:pass)\n');
}

if (proxies.length === 0) {
    console.warn(chalk.yellow('WARNING: No proxies found in proxies.txt. Running with YOUR IP (Views might not count).'));
    proxies.push(null); // Add one direct connection
}

console.log(chalk.green(`Starting ViewBot for: ${TARGET_URL}`));
console.log(chalk.blue(`Loaded ${proxies.length} proxies/identities.`));

async function runBrowser(proxy, id) {
    const log = (msg) => console.log(chalk.magenta(`[Bot ${id}]`) + ' ' + msg);

    let launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,720',
        '--mute-audio', // Mute to identify as "background" less easily? Actually unmuting is better but annoying.
        '--autoplay-policy=no-user-gesture-required'
    ];

    let proxyUrl = null;
    let username = null;
    let password = null;

    if (proxy) {
        // Parse Proxy
        // Formats: 
        // 1. ip:port
        // 2. http://user:pass@ip:port
        // 3. ip:port:user:pass

        if (proxy.includes('@')) {
            // Standard URL format
            launchArgs.push(`--proxy-server=${proxy}`);
        } else if (proxy.split(':').length === 4) {
            // ip:port:user:pass
            const parts = proxy.split(':');
            launchArgs.push(`--proxy-server=${parts[0]}:${parts[1]}`);
            username = parts[2];
            password = parts[3];
        } else {
            launchArgs.push(`--proxy-server=${proxy}`);
        }
    }

    log(`Launching... ${proxy ? 'Ref: Proxy' : 'Ref: Direct'}`);

    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new", // "new" is faster, but false is visible for debugging
            args: launchArgs
        });

        const page = await browser.newPage();

        // Stealth/Anonymity improvements
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        if (username && password) {
            await page.authenticate({ username, password });
        }

        // Optimization: Block images/fonts to save bandwidth
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'font', 'stylesheet'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        log('Navigating to YouTube...');
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Try to click play if needed, or unmute
        log('Watching...');

        // Random duration
        const duration = Math.floor(Math.random() * (VIEW_DURATION[1] - VIEW_DURATION[0])) + VIEW_DURATION[0];
        log(`Staying for ${duration / 1000}s`);

        // Simulate mouse movement
        await page.mouse.move(100, 100);
        await page.mouse.move(200, 200);

        await new Promise(r => setTimeout(r, duration));

        log('Finished.');

    } catch (e) {
        log(chalk.red(`Error: ${e.message}`));
    } finally {
        if (browser) await browser.close();
    }
}

// Queue system
async function startQueue() {
    let active = 0;
    let index = 0;

    const next = () => {
        if (index >= proxies.length) return;

        if (active < CONCURRENCY) {
            const p = proxies[index];
            const i = index;
            index++;
            active++;
            runBrowser(p, i + 1).then(() => {
                active--;
                if (index < proxies.length) next();
                else if (active === 0) console.log(chalk.green('All bots finished.'));
            });
            next(); // Try to spawn more if we have concurrency slots
        }
    };

    next();
}

startQueue();
