import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import chalk from 'chalk';

const INPUT_FILE = 'all_proxies.txt';
const OUTPUT_FILE = 'proxies.txt'; // Write directly to active file
const TEST_URL = 'https://www.google.com';
const TIMEOUT = 10000; // 10s timeout
const CONCURRENCY = 20;

async function checkProxy(proxy) {
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
        console.log(chalk.green(`✓ ${proxy} (${duration}ms)`));
        return proxy;
    } catch (e) {
        // console.log(chalk.red(`✗ ${proxy} - ${e.message}`));
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

    console.log(chalk.blue(`Found ${proxies.length} proxies. Checking connectivity...`));

    const validProxies = [];
    let p = Promise.resolve();

    // Chunk execution
    for (let i = 0; i < proxies.length; i += CONCURRENCY) {
        const chunk = proxies.slice(i, i + CONCURRENCY);
        const tasks = chunk.map(proxy => checkProxy(proxy));
        const results = await Promise.all(tasks);
        validProxies.push(...results.filter(r => r !== null));
        console.log(chalk.yellow(`Progress: ${Math.min(i + CONCURRENCY, proxies.length)}/${proxies.length} | Valid: ${validProxies.length}`));
    }

    console.log(chalk.green(`\nDone! Found ${validProxies.length} active proxies.`));
    if (validProxies.length > 0) {
        fs.writeFileSync(OUTPUT_FILE, validProxies.join('\n'));
        console.log(chalk.white(`Saved to ${OUTPUT_FILE}`));
        console.log(chalk.magenta(`\nTo use these, rename ${OUTPUT_FILE} to ${INPUT_FILE}`));
    } else {
        console.log(chalk.red('No valid proxies found.'));
    }
}

main();
