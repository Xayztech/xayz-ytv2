'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const axios = require('axios');
const yt = require('../core/xayz-yt');
const { createKey, getKeyStats, isValidKey } = require('../core/apikey');

const page = (name) => path.join(__dirname, '../public/pages', name + '.html');

// ─── Home ────────────────────────────────────────────────────────────────────
router.get('/xayz/home', (req, res) => res.sendFile(page('home')));
router.get('/', (req, res) => res.redirect('/xayz/home'));

// ─── Search ──────────────────────────────────────────────────────────────────
router.get('/xayz/search', (req, res) => res.sendFile(page('search')));

// ─── Search + Download ───────────────────────────────────────────────────────
router.get('/xayz/search-download', (req, res) => res.sendFile(page('search-download')));

// ─── Docs ─────────────────────────────────────────────────────────────────────
router.get('/xayz/yt/docs', (req, res) => res.sendFile(page('docs')));

// ─── Tutorial ─────────────────────────────────────────────────────────────────
router.get('/xayz/yt/tutorial', (req, res) => res.sendFile(page('tutorial')));

// ─── API Key Generator ───────────────────────────────────────────────────────
router.get('/xayz/yt/apikey', (req, res) => res.sendFile(page('apikey')));
router.post('/xayz/yt/apikey/generate', express.json(), (req, res) => {
    const name = req.body?.name || 'Anonymous';
    const key = createKey(name);
    res.json({ status: true, key, plan: 'free_lifetime', unlimited: true });
});

// ─── Cek API Key ─────────────────────────────────────────────────────────────
router.get('/xayz/yt/cek-apikey', (req, res) => res.sendFile(page('cek-apikey')));
router.get('/xayz/yt/cek-apikey/check', (req, res) => {
    const key = req.query.key || req.query.apikey;
    if (!key) return res.json({ status: false, message: 'API key tidak boleh kosong!' });
    if (!isValidKey(key)) return res.json({ status: false, message: 'API key tidak valid atau tidak aktif!' });
    const stats = getKeyStats(key);
    res.json({ status: true, data: stats });
});

// ─── CDN Download Redirect ───────────────────────────────────────────────────
router.get('/xayz-yt/sys/cdn-download/:type/:quality', async (req, res) => {
    const { type, quality } = req.params;
    const url = req.query.url || req.query.link;
    if (!url) return res.status(400).send('URL YouTube diperlukan!');

    try {
        const fn = type === 'mp3' ? yt.ytmp3 : yt.ytmp4;
        const data = await fn(url, Number(quality));

        if (!data.status || !data.download?.url) {
            return res.status(500).send('Gagal mengambil link download.');
        }

        const downloadUrl = data.download.url;
        const filename = encodeURIComponent(data.download.filename || `download.${type}`);

        // Stream the file with metadata headers for proper media tags
        const fileRes = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
                'Referer': 'https://save-tube.com/'
            },
            timeout: 30000
        });

        const contentType = type === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Forward content-length if available
        if (fileRes.headers['content-length']) {
            res.setHeader('Content-Length', fileRes.headers['content-length']);
        }

        fileRes.data.pipe(res);
    } catch (err) {
        console.error('CDN Download error:', err.message);
        res.status(500).send('Error saat mendownload: ' + err.message);
    }
});

module.exports = router;
