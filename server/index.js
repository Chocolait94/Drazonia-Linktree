import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3001;
const root = path.dirname(fileURLToPath(import.meta.url));
const cache = { value: null, expiresAt: 0 };
const externalRequestTimeout = 10_000;

const fetchExternal = (url, options = {}) => fetch(url, {
  ...options,
  signal: AbortSignal.timeout(externalRequestTimeout)
});

async function getTwitchToken() {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID || "",
    client_secret: process.env.TWITCH_CLIENT_SECRET || "",
    grant_type: "client_credentials"
  });
  const response = await fetchExternal(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST" });
  if (!response.ok) throw new Error("Impossible d'obtenir le token Twitch");
  return response.json();
}

async function getTwitchStatus() {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    return { online: false, configured: false };
  }
  const token = await getTwitchToken();
  const response = await fetchExternal("https://api.twitch.tv/helix/streams?user_login=drazonia", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID
    }
  });
  if (!response.ok) throw new Error("Impossible de vÃ©rifier Twitch");
  const data = await response.json();
  const stream = data.data?.[0];
  return {
    online: Boolean(stream),
    configured: true,
    title: stream?.title || "",
    viewers: stream?.viewer_count || 0,
    startedAt: stream?.started_at || null
  };
}

function durationInSeconds(duration) {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return Infinity;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

async function getYoutubeVideos() {
  const channelId = /^UC[\w-]{22}$/.test(process.env.YOUTUBE_CHANNEL_ID || "")
    ? process.env.YOUTUBE_CHANNEL_ID
    : null;
  if (!process.env.YOUTUBE_API_KEY) return [];
  if (!channelId) return [];
  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    q: "#shorts",
    maxResults: "50",
    order: "date",
    type: "video",
    key: process.env.YOUTUBE_API_KEY
  });
  const response = await fetchExternal(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!response.ok) throw new Error("Impossible de rÃ©cupÃ©rer YouTube");
  const data = await response.json();
  const items = data.items || [];
  if (!items.length) return [];
  const detailsResponse = await fetchExternal(`https://www.googleapis.com/youtube/v3/videos?${new URLSearchParams({
    part: "contentDetails,statistics",
    id: items.map((item) => item.id.videoId).join(","),
    key: process.env.YOUTUBE_API_KEY
  })}`);
  if (!detailsResponse.ok) throw new Error("Impossible de rÃ©cupÃ©rer les dÃ©tails YouTube");
  const details = await detailsResponse.json();
  const detailsById = new Map((details.items || []).map((item) => [item.id, item]));
  const videos = items.map((item) => {
    const detail = detailsById.get(item.id.videoId);
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
      views: Number(detail?.statistics?.viewCount || 0),
      duration: detail?.contentDetails?.duration || ""
    };
  });
  const shorts = videos.filter((video) => durationInSeconds(video.duration) <= 180);
  return (shorts.length ? shorts : videos).slice(0, 6);
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use("/api", rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Trop de requÃªtes. RÃ©essaie dans un instant." }
}));

app.get("/api/status", async (_request, response) => {
  try {
    if (cache.value && cache.expiresAt > Date.now()) return response.json(cache.value);
    const [twitch, videos] = await Promise.all([getTwitchStatus(), getYoutubeVideos()]);
    cache.value = { twitch, videos, checkedAt: new Date().toISOString() };
    cache.expiresAt = Date.now() + 60_000;
    response.json(cache.value);
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "Les services sont temporairement indisponibles." });
  }
});

app.use(express.static(path.resolve(root, "..")));
app.get("*splat", (_request, response) => {
  response.sendFile(path.resolve(root, "..", "index.html"));
});

app.listen(port, () => console.log(`Drazonia server: http://localhost:${port}`));
