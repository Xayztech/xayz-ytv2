'use strict';

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// In-memory store (replace with real DB for production)
const apikeys = new Map();
const usageLogs = new Map();

function generateKey() {
    const prefix = 'XAYZ-';
    const part1 = crypto.randomBytes(4).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(4).toString('hex').toUpperCase();
    const part3 = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${part1}-${part2}-${part3}`;
}

function createKey(ownerName = 'Anonymous') {
    const key = generateKey();
    const id = uuidv4();
    apikeys.set(key, {
        id,
        key,
        owner: ownerName,
        createdAt: new Date().toISOString(),
        status: 'active',
        plan: 'free_lifetime',
        unlimited: true,
        totalRequests: 0,
        ips: [],
        domains: [],
        userAgents: [],
        logs: []
    });
    usageLogs.set(key, []);
    return key;
}

function getKey(key) {
    return apikeys.get(key) || null;
}

function isValidKey(key) {
    const data = apikeys.get(key);
    return data && data.status === 'active';
}

function logRequest(key, req) {
    if (!apikeys.has(key)) return;
    const data = apikeys.get(key);
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const host = req.headers['host'] || req.headers['origin'] || 'unknown';

    data.totalRequests++;
    if (!data.ips.includes(ip)) data.ips.push(ip);
    if (!data.domains.includes(host)) data.domains.push(host);
    if (!data.userAgents.includes(ua)) data.userAgents.push(ua);

    const logEntry = {
        no: data.logs.length + 1,
        timestamp: new Date().toISOString(),
        ip,
        ua,
        domain: host,
        endpoint: req.originalUrl || req.url || '/',
        method: req.method || 'GET'
    };
    data.logs.unshift(logEntry);
    if (data.logs.length > 100) data.logs = data.logs.slice(0, 100);
    apikeys.set(key, data);
}

function censorIP(ip) {
    if (!ip || ip === 'unknown') return '***.***.***';
    const parts = ip.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.***.***`;
    }
    return ip.substring(0, Math.floor(ip.length / 2)) + '***';
}

function censorDomain(domain) {
    if (!domain || domain === 'unknown') return '***';
    const parts = domain.split('.');
    if (parts.length >= 2) {
        const tld = parts[parts.length - 1];
        const main = parts[parts.length - 2];
        return `***${main.length > 3 ? main.substring(0, 2) : '*'}***.${tld}`;
    }
    return domain.substring(0, 3) + '***';
}

function getKeyStats(key) {
    const data = apikeys.get(key);
    if (!data) return null;
    return {
        id: data.id,
        key: data.key,
        owner: data.owner,
        createdAt: data.createdAt,
        status: data.status,
        plan: data.plan,
        unlimited: data.unlimited,
        totalRequests: data.totalRequests,
        uniqueIPs: data.ips.length,
        uniqueDomains: data.domains.length,
        logs: data.logs.map((log, i) => ({
            no: i + 1,
            timestamp: log.timestamp,
            ip: censorIP(log.ip),
            ua: log.ua.length > 60 ? log.ua.substring(0, 60) + '...' : log.ua,
            domain: censorDomain(log.domain),
            endpoint: log.endpoint,
            method: log.method
        }))
    };
}

// Pre-generate some demo keys for showcase
const demoKey = createKey('Demo User');
const defaultKey = 'XAYZ-FREE-0000-0000';
apikeys.set(defaultKey, {
    id: uuidv4(),
    key: defaultKey,
    owner: 'Public Free Key',
    createdAt: new Date().toISOString(),
    status: 'active',
    plan: 'free_lifetime',
    unlimited: true,
    totalRequests: 0,
    ips: [],
    domains: [],
    userAgents: [],
    logs: []
});

module.exports = { createKey, getKey, isValidKey, logRequest, getKeyStats, censorIP, censorDomain };
