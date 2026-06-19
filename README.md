# XAYZ YT Platform

Ultra Modern YouTube API & Downloader Platform oleh XYCoolcraft.

## 🚀 Features
- 🏠 Home `/xayz/home` — YouTube downloader dengan custom media player
- 🔍 Search `/xayz/search` — Pencarian video YouTube
- ⚡ Search + Download `/xayz/search+download` — Cari & download sekaligus
- 📚 Docs `/xayz/yt/docs` — Dokumentasi API lengkap
- 🎓 Tutorial `/xayz/yt/tutorial` — Tutorial step-by-step
- 🔑 API Key `/xayz/yt/apikey` — Generate API Key gratis
- ✅ Cek Key `/xayz/yt/cek-apikey` — Pantau penggunaan API key
- 🌐 API `/xayz/yt-machine/api` — REST API endpoint

## 📦 Install

```bash
npm install
node server.js
```

## 🌐 Deploy

### Vercel (Serverless)
```bash
npm i -g vercel
vercel deploy
```

### VPS / Ubuntu
```bash
npm install
npm install -g pm2
pm2 start server.js --name xayz-yt
pm2 save
```

### Railway / Render
Set `start` command: `node server.js`

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔑 API Usage

```
GET /xayz/yt-machine/api/search?q=keyword&apikey=YOUR_KEY
GET /xayz/yt-machine/api/ytmp3?url=YT_URL&quality=320&apikey=YOUR_KEY
GET /xayz/yt-machine/api/ytmp4?url=YT_URL&quality=1080&apikey=YOUR_KEY
GET /xayz/yt-machine/api/metadata?url=YT_URL&apikey=YOUR_KEY
GET /xayz/yt-machine/api/channel?input=@handle&apikey=YOUR_KEY
```

## 📝 License
MIT — XYCoolcraft
