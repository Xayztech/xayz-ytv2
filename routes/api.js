'use strict';

const express = require('express');
const router = express.Router();
const yt = require('../core/xayz-yt');
const { requireApiKey, optionalApiKey } = require('../middleware/index');

const respond = (res, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.json(data);
};

// CORS preflight
router.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.status(204).end();
});

// ─── Health / Info ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    respond(res, {
        status: true,
        name: 'XAYZ YouTube API',
        version: '2.0.0',
        creator: 'XYCoolcraft',
        endpoints: {
            search:   'GET  /xayz/yt-machine/api/search?q=keyword&apikey=KEY',
            ytmp3:    'GET  /xayz/yt-machine/api/ytmp3?url=YT_URL&quality=128&apikey=KEY',
            ytmp4:    'GET  /xayz/yt-machine/api/ytmp4?url=YT_URL&quality=360&apikey=KEY',
            metadata: 'GET  /xayz/yt-machine/api/metadata?url=YT_URL&apikey=KEY',
            channel:  'GET  /xayz/yt-machine/api/channel?input=HANDLE_OR_URL&apikey=KEY'
        },
        audio_qualities: [92, 128, 256, 320],
        video_qualities: [144, 360, 480, 720, 1080],
        docs: '/xayz/yt/docs',
        get_apikey: '/xayz/yt/apikey'
    });
});

// ─── Search ──────────────────────────────────────────────────────────────────
router.get('/search', requireApiKey, async (req, res) => {
    const q = req.query.q || req.query.query || req.query.keyword || req.query.k;
    if (!q) return respond(res, { status: false, message: 'Parameter q (query) wajib diisi!' });
    const data = await yt.search(q);
    respond(res, data);
});

router.post('/search', requireApiKey, async (req, res) => {
    const q = req.body?.q || req.body?.query || req.body?.keyword;
    if (!q) return respond(res, { status: false, message: 'Body field q (query) wajib diisi!' });
    const data = await yt.search(q);
    respond(res, data);
});

// ─── YT MP3 ──────────────────────────────────────────────────────────────────
router.get('/ytmp3', requireApiKey, async (req, res) => {
    const url = req.query.url || req.query.link || req.query.u;
    const quality = req.query.quality || req.query.q || 128;
    if (!url) return respond(res, { status: false, message: 'Parameter url wajib diisi!' });
    const data = await yt.ytmp3(url, quality);
    respond(res, data);
});

router.post('/ytmp3', requireApiKey, async (req, res) => {
    const url = req.body?.url || req.body?.link;
    const quality = req.body?.quality || 128;
    if (!url) return respond(res, { status: false, message: 'Body field url wajib diisi!' });
    const data = await yt.ytmp3(url, quality);
    respond(res, data);
});

// ─── YT MP4 ──────────────────────────────────────────────────────────────────
router.get('/ytmp4', requireApiKey, async (req, res) => {
    const url = req.query.url || req.query.link || req.query.u;
    const quality = req.query.quality || req.query.q || 360;
    if (!url) return respond(res, { status: false, message: 'Parameter url wajib diisi!' });
    const data = await yt.ytmp4(url, quality);
    respond(res, data);
});

router.post('/ytmp4', requireApiKey, async (req, res) => {
    const url = req.body?.url || req.body?.link;
    const quality = req.body?.quality || 360;
    if (!url) return respond(res, { status: false, message: 'Body field url wajib diisi!' });
    const data = await yt.ytmp4(url, quality);
    respond(res, data);
});

// ─── Metadata ────────────────────────────────────────────────────────────────
router.get('/metadata', requireApiKey, async (req, res) => {
    const url = req.query.url || req.query.link || req.query.u || req.query.id;
    if (!url) return respond(res, { status: false, message: 'Parameter url wajib diisi!' });
    const data = await yt.metadata(url);
    respond(res, data);
});

router.post('/metadata', requireApiKey, async (req, res) => {
    const url = req.body?.url || req.body?.link || req.body?.id;
    if (!url) return respond(res, { status: false, message: 'Body field url wajib diisi!' });
    const data = await yt.metadata(url);
    respond(res, data);
});

// ─── Channel ─────────────────────────────────────────────────────────────────
router.get('/channel', requireApiKey, async (req, res) => {
    const input = req.query.input || req.query.channel || req.query.handle || req.query.url;
    if (!input) return respond(res, { status: false, message: 'Parameter input wajib diisi!' });
    const data = await yt.channel(input);
    respond(res, data);
});

router.post('/channel', requireApiKey, async (req, res) => {
    const input = req.body?.input || req.body?.channel || req.body?.handle || req.body?.url;
    if (!input) return respond(res, { status: false, message: 'Body field input wajib diisi!' });
    const data = await yt.channel(input);
    respond(res, data);
});

// ─── CDN Download Redirect ───────────────────────────────────────────────────
// This is served at /xayz-yt/sys/cdn-download/ — handled in server.js
// But we expose a helper endpoint here
router.get('/stream', optionalApiKey, async (req, res) => {
    const url = req.query.url || req.query.link;
    const type = (req.query.type || 'mp4').toLowerCase();
    const quality = req.query.quality || (type === 'mp3' ? 128 : 360);
    if (!url) return respond(res, { status: false, message: 'Parameter url wajib diisi!' });

    const fn = type === 'mp3' ? yt.ytmp3 : yt.ytmp4;
    const data = await fn(url, quality);
    if (!data.status || !data.download?.url) {
        return respond(res, { status: false, message: 'Gagal mendapatkan stream URL' });
    }
    respond(res, { status: true, stream_url: data.download.url, filename: data.download.filename, quality: data.download.quality });
});

module.exports = router;
