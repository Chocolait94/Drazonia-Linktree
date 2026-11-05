import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Instagram,
  Mail,
  Play,
  Radio,
  Sparkles,
  Twitch,
  Youtube
} from "lucide-react";
import "./styles.css";

const socials = [
  { label: "Twitch", href: "https://www.twitch.tv/drazonia", icon: Twitch, className: "twitch" },
  { label: "YouTube", href: "https://www.youtube.com/@Drazonia", icon: Youtube, className: "youtube" },
  { label: "Instagram", href: "https://www.instagram.com/drazoniaa/", icon: Instagram, className: "instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@drazonia", image: "/assets/tiktok.png", className: "tiktok" },
  { label: "Discord", href: "https://discord.gg/5x45YRtrPX", image: "/assets/discord.svg", className: "discord" },
  { label: "Portfolio", href: "https://portfolio-de-drazonia.vercel.app/", icon: BriefcaseBusiness, className: "portfolio" }
];

function formatViews(views) {
  if (!views) return "Vues en cours de chargement";
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(".0", "")} M vues`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(".0", "")} k vues`;
  return `${views} vue${views === 1 ? "" : "s"}`;
}

function formatAge(date) {
  if (!date) return "";
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000));
  if (days < 7) return `il y a ${Math.max(1, days)} jour${days > 1 ? "s" : ""}`;
  if (days < 30) return `il y a ${Math.floor(days / 7)} semaine${days >= 14 ? "s" : ""}`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

function App() {
  const [status, setStatus] = useState({ twitch: { online: false }, videos: [] });
  const [apiError, setApiError] = useState(false);
  const [videoSort, setVideoSort] = useState("latest");

  useEffect(() => {
    const loadStatus = () => fetch("/api/status")
      .then((response) => {
        if (!response.ok) throw new Error("status");
        return response.json();
      })
      .then((data) => { setStatus(data); setApiError(false); })
      .catch(() => setApiError(true));
    loadStatus();
    const timer = setInterval(loadStatus, 60_000);
    return () => clearInterval(timer);
  }, []);

  const twitchOnline = status.twitch?.online;
  const videos = status.videos.length ? status.videos : [
    { id: "channel", title: "Découvre mes derniers Shorts", thumbnail: "/assets/drazonia.png", views: 0 }
  ];
  const sortedVideos = [...videos].sort((a, b) => {
    if (videoSort === "popular") return b.views - a.views;
    if (videoSort === "oldest") return new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0);
    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });

  return (
    <main className="page-shell">
      <video className="background-video" autoPlay loop muted playsInline poster="/assets/drazonia.png">
        <source src="/assets/background.mp4" type="video/mp4" />
      </video>
      <div className="background-overlay" />
      <div className="firefly firefly-one" /><div className="firefly firefly-two" />
      <section className="content">
        <header className="profile">
          <div className="avatar-wrap"><img src="/assets/drazonia.png" alt="Drazonia" /></div>
          <p className="eyebrow"><Sparkles size={14} /> CRÉATRICE • GAMING • LIVE</p>
          <h1>Drazonia</h1>
          <p className="intro">Bienvenue dans mon univers ✦<br />Retrouve-moi sur mes réseaux !</p>
        </header>

        <div className="layout">
          <section className="social-panel" aria-label="Réseaux sociaux">
            <img className="decor-character character-blue" src="/assets/gestos.png" alt="" aria-hidden="true" />
            <div className="section-label"><span>MES RÉSEAUX</span><span className="stars">✦ ✧</span></div>
            <div className="social-list">
              {socials.map(({ label, href, icon: Icon, image, className }) => (
                <a className={`social-link ${className}`} href={href} target="_blank" rel="noreferrer" key={label}>
                  <span className="social-icon">{image ? <img src={image} alt="" /> : <Icon size={20} strokeWidth={2.2} />}</span>
                  <span>{label}</span><ArrowUpRight className="arrow" size={16} />
                </a>
              ))}
              <a className="social-link contact" href="mailto:Drazoniapro@gmail.com">
                <span className="social-icon"><Mail size={20} /></span><span>Me contacter</span><ArrowUpRight className="arrow" size={16} />
              </a>
            </div>
          </section>

          <section className="live-column">
            <div className={`live-card ${twitchOnline ? "is-live" : ""}`}>
              <img className="decor-character character-pink" src="/assets/horney.png" alt="" aria-hidden="true" />
              <div className="live-header"><span className="live-dot" /> {twitchOnline ? "EN DIRECT" : "HORS LIGNE"} <Radio size={16} /></div>
              {twitchOnline ? (
                <a className="stream-embed" href="https://www.twitch.tv/drazonia" target="_blank" rel="noreferrer">
                  <span className="play-circle"><Play fill="currentColor" size={20} /></span>
                  <strong>Rejoindre le live</strong>
                  <small>{status.twitch.viewers || 0} spectateur{status.twitch.viewers === 1 ? "" : "s"}</small>
                </a>
              ) : (
                <div className="offline-message"><strong>Le live arrive bientôt</strong><span>Active les notifications pour ne rien manquer ✦</span></div>
              )}
            </div>
            <div className="videos">
              <div className="video-toolbar">
                <h2>Shorts YouTube</h2>
                <div className="video-tabs" role="tablist" aria-label="Trier les Shorts">
                  {[["latest", "Latest"], ["popular", "Popular"], ["oldest", "Oldest"]].map(([value, label]) => (
                    <button className={videoSort === value ? "active" : ""} onClick={() => setVideoSort(value)} key={value} role="tab" aria-selected={videoSort === value}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="video-grid">
                {sortedVideos.map((video) => (
                  <a className="video-card" href={video.id === "channel" ? "https://www.youtube.com/@Drazonia/shorts" : `https://www.youtube.com/shorts/${video.id}`} target="_blank" rel="noreferrer" key={video.id}>
                    <span className="video-thumb"><img src={video.thumbnail} alt="" /><span className="video-play"><Play fill="currentColor" size={15} /></span></span>
                    <strong className="video-title">{video.title}</strong>
                    <small className="video-views">{formatViews(video.views)}</small>
                  </a>
                ))}
              </div>
              <a className="all-videos" href="https://www.youtube.com/@Drazonia/shorts" target="_blank" rel="noreferrer">Voir tous les Shorts <span>→</span></a>
              {apiError && <p className="api-note">Les dernières données seront mises à jour dès que les services répondent.</p>}
            </div>
          </section>
        </div>
        <footer>© Drazonia 2026 — Tous droits réservés</footer>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
