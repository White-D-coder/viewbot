import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import chalk from 'chalk';

const INPUT_FILE = 'all_proxies.txt';
const OUTPUT_FILE = 'proxies.txt';
const TEST_URL = 'http://httpbin.org/ip'; // Lightweight IP check
const TIMEOUT = 3000; // 3s aggressive timeout for fast scanning
const CONCURRENCY = 100; // Blast through the list

async function checkProxy(proxy) {
    if (!proxy) return null;
    const [ip, port, user, pass] = proxy.split(':');
    let agent;
    const proxyUrl = user && pass ? `http://${user}:${pass}@${ip}:${port}` : `http://${ip}:${port}`;

    try {
        agent = new HttpsProxyAgent(proxyUrl);
        const start = Date.now();
        await axios.get(TEST_URL, {
            httpsAgent: agent,
            timeout: TIMEOUT,
            validateStatus: (status) => status === 200
        });
        const duration = Date.now() - start;
        // console.log(chalk.green(`✓ ${proxy} (${duration}ms)`));
        return proxy;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log(chalk.blue(`Reading ${INPUT_FILE}...`));
    let proxies = [];
    try {
        proxies = fs.readFileSync(INPUT_FILE, 'utf8')
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#'));
    } catch (e) {
        console.error('File not found:', INPUT_FILE);
        process.exit(1);
    }

    console.log(chalk.blue(`Turbo-Scanning ${proxies.length} proxies (Concurrency: ${CONCURRENCY})...`));

    const validProxies = [];

    // Chunk execution
    for (let i = 0; i < proxies.length; i += CONCURRENCY) {
        const chunk = proxies.slice(i, i + CONCURRENCY);
        const tasks = chunk.map(proxy => checkProxy(proxy));

        process.stdout.write(chalk.yellow(`Scanning ${i}-${Math.min(i + CONCURRENCY, proxies.length)}... `));

        const results = await Promise.all(tasks);
        const working = results.filter(r => r !== null);
        validProxies.push(...working);

        process.stdout.write(chalk.green(`Found: ${working.length} (Total: ${validProxies.length})\n`));
    }

    console.log(chalk.green(`\nDone! Found ${validProxies.length} active proxies.`));
    if (validProxies.length > 0) {
        fs.writeFileSync(OUTPUT_FILE, validProxies.join('\n'));
        console.log(chalk.white(`Saved WORKING proxies to ${OUTPUT_FILE}`));
    } else {
        console.log(chalk.red('No valid proxies found. Bots will fail without better proxies.'));
        fs.writeFileSync(OUTPUT_FILE, ''); // Clear it so bot warns user
    }
}

main();
