'use strict';

const { isValidKey, logRequest } = require('../core/apikey');

// Anti-scraping / source code protection middleware
function sourceProtection(req, res, next) {
    // Block common scrapers and automated tools trying to steal source
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const blockedUA = ['wget', 'curl/7', 'python-requests', 'scrapy', 'go-http', 'java/', 'libwww', 'okhttp'];
    const isBlockedUA = blockedUA.some(b => ua.includes(b));

    // Allow API routes for all (they need programmatic access)
    if (req.path.startsWith('/xayz/yt-machine/api') || req.path.startsWith('/xayz-yt/sys/')) {
        return next();
    }

    // Block direct file access attempts
    if (req.path.match(/\.(js|ts|json|env|config)$/i) && !req.path.startsWith('/assets')) {
        return res.status(403).json({ error: 'Access denied', code: 403 });
    }

    if (isBlockedUA && !req.path.startsWith('/xayz/yt-machine/api')) {
        return res.status(403).send('Access Denied');
    }

    next();
}

// Security headers
function securityHeaders(req, res, next) {
    res.setHeader('X-Powered-By', 'XYCoolcraft-Platform');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-store');
    next();
}

// API key validator middleware
function requireApiKey(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.apikey || req.query.key;
    if (!key) {
        return res.status(401).json({
            status: false,
            code: 401,
            message: 'API key required. Add header: x-api-key or query: ?apikey=YOUR_KEY',
            docs: '/xayz/yt/docs'
        });
    }
    if (!isValidKey(key)) {
        return res.status(403).json({
            status: false,
            code: 403,
            message: 'Invalid or inactive API key.',
            get_key: '/xayz/yt/apikey'
        });
    }
    req.apiKey = key;
    logRequest(key, req);
    next();
}

// Optional API key (log if present, don't block)
function optionalApiKey(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.apikey || req.query.key;
    if (key && isValidKey(key)) {
        req.apiKey = key;
        logRequest(key, req);
    }
    next();
}

module.exports = { sourceProtection, securityHeaders, requireApiKey, optionalApiKey };
