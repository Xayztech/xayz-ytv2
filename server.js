'use strict';

const express = require('express');
const path = require('path');
const cors = require('cors');

const { sourceProtection, securityHeaders } = require('./middleware/index');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityHeaders);
app.use(sourceProtection);

// ─── Static Assets ────────────────────────────────────────────────────────────
// Only serve /assets path — never expose source files directly
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), {
    dotfiles: 'deny',
    index: false
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
// Path: /xayz/yt-machine/api/* — actual logic in /routes/api.js (different path/location)
app.use('/xayz/yt-machine/api', apiRoutes);

// ─── Page Routes ──────────────────────────────────────────────────────────────
app.use('/', pageRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    if (req.accepts('json') && !req.accepts('html')) {
        return res.status(404).json({ status: false, code: 404, message: 'Endpoint tidak ditemukan.' });
    }
    res.status(404).redirect('/xayz/home');
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ status: false, code: 500, message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 XAYZ YT Platform running at http://localhost:${PORT}`);
        console.log(`   Home     : http://localhost:${PORT}/xayz/home`);
        console.log(`   API      : http://localhost:${PORT}/xayz/yt-machine/api`);
        console.log(`   Docs     : http://localhost:${PORT}/xayz/yt/docs`);
        console.log(`   API Key  : http://localhost:${PORT}/xayz/yt/apikey`);
    });
}

// Export for Vercel / serverless
module.exports = app;
