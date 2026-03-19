import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

// ============================================================
// CONFIGURATION & SUPABASE CLIENT
// ============================================================
// In production, replace with your actual Supabase credentials
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Demo mode flag - set to false when Supabase is configured
const DEMO_MODE = true;

// ============================================================
// CONTEXT
// ============================================================
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ============================================================
// MOCK DATA
// ============================================================
const NICHES = ["Lifestyle", "Mote", "Mat", "Trening", "Gaming", "Tech", "Reise", "Skjønnhet", "Annet"];

const MOCK_INFLUENCERS = [
  {
    id: "1", name: "Sara Nordvik", username: "@saranordvik", bio: "Lifestyle & reise-entusiast fra Oslo. Deler hverdagsinspirasjoner og reistips.",
    city: "Oslo", country: "Norge", age: 26, niche: "Lifestyle",
    followers: 124000, engagement_rate: 4.8,
    age_distribution: { "13-17": 5, "18-24": 45, "25-34": 35, "35-44": 10, "45+": 5 },
    gender_distribution: { female: 78, male: 22 },
    top_markets: [{ city: "Oslo", country: "Norge" }, { city: "Stockholm", country: "Sverige" }, { city: "København", country: "Danmark" }],
    avatar: null, verified: true
  },
  {
    id: "2", name: "Erik Johansen", username: "@erikjgaming", bio: "Pro gamer & tech reviewer. Streamer og innholdsskaper.",
    city: "Bergen", country: "Norge", age: 23, niche: "Gaming",
    followers: 89000, engagement_rate: 6.2,
    age_distribution: { "13-17": 20, "18-24": 50, "25-34": 22, "35-44": 5, "45+": 3 },
    gender_distribution: { female: 25, male: 75 },
    top_markets: [{ city: "Bergen", country: "Norge" }, { city: "Oslo", country: "Norge" }, { city: "Göteborg", country: "Sverige" }],
    avatar: null, verified: false
  },
  {
    id: "3", name: "Mia Chen", username: "@miafoodie", bio: "Matblogger & kokk. Fusjonmat og nordiske smaker.",
    city: "Trondheim", country: "Norge", age: 30, niche: "Mat",
    followers: 210000, engagement_rate: 5.1,
    age_distribution: { "13-17": 3, "18-24": 25, "25-34": 42, "35-44": 20, "45+": 10 },
    gender_distribution: { female: 68, male: 32 },
    top_markets: [{ city: "Trondheim", country: "Norge" }, { city: "Oslo", country: "Norge" }, { city: "London", country: "UK" }],
    avatar: null, verified: true
  },
  {
    id: "4", name: "Jonas Lie", username: "@jonasfit", bio: "Sertifisert PT og ernæringsrådgiver. Hjelper deg nå målene dine!",
    city: "Stavanger", country: "Norge", age: 28, niche: "Trening",
    followers: 67000, engagement_rate: 7.3,
    age_distribution: { "13-17": 8, "18-24": 38, "25-34": 35, "35-44": 14, "45+": 5 },
    gender_distribution: { female: 45, male: 55 },
    top_markets: [{ city: "Stavanger", country: "Norge" }, { city: "Oslo", country: "Norge" }, { city: "Bergen", country: "Norge" }],
    avatar: null, verified: false
  },
  {
    id: "5", name: "Amina Hassan", username: "@aminabeauty", bio: "Makeup artist & skjønnhetsguru. Clean beauty-ambassadør.",
    city: "Oslo", country: "Norge", age: 24, niche: "Skjønnhet",
    followers: 156000, engagement_rate: 5.8,
    age_distribution: { "13-17": 12, "18-24": 48, "25-34": 28, "35-44": 8, "45+": 4 },
    gender_distribution: { female: 92, male: 8 },
    top_markets: [{ city: "Oslo", country: "Norge" }, { city: "Stockholm", country: "Sverige" }, { city: "København", country: "Danmark" }],
    avatar: null, verified: true
  },
  {
    id: "6", name: "Lars Henriksen", username: "@larstravels", bio: "Digital nomad og reiseblogger. 45+ land og teller!",
    city: "Tromsø", country: "Norge", age: 32, niche: "Reise",
    followers: 98000, engagement_rate: 4.2,
    age_distribution: { "13-17": 4, "18-24": 30, "25-34": 40, "35-44": 18, "45+": 8 },
    gender_distribution: { female: 55, male: 45 },
    top_markets: [{ city: "Tromsø", country: "Norge" }, { city: "Oslo", country: "Norge" }, { city: "Reykjavik", country: "Island" }],
    avatar: null, verified: false
  }
];

const MOCK_MESSAGES = [
  { id: "m1", from_id: "company1", to_id: "1", from_name: "NordicBrand AS", content: "Hei Sara! Vi vil gjerne samarbeide med deg.", timestamp: "2026-03-18T14:30:00", read: false },
  { id: "m2", from_id: "1", to_id: "company1", from_name: "Sara Nordvik", content: "Hei! Høres spennende ut, fortell mer!", timestamp: "2026-03-18T15:00:00", read: true },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatFollowers(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  const colors = ["#7c3aed", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ============================================================
// ICONS (inline SVG components)
// ============================================================
const Icons = {
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Users: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Mail: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Home: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  User: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Star: () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  Check: () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01" fill="none" stroke="currentColor" strokeWidth="2"/></svg>,
  Send: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
  ChevronRight: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>,
  Globe: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Heart: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  BarChart: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  MapPin: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  X: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Filter: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6"/></svg>,
  Logout: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Instagram: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>,
  Zap: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  ArrowRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
};

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  :root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #111118;
    --bg-card: #16161f;
    --bg-card-hover: #1c1c28;
    --bg-elevated: #1e1e2a;
    --border-color: rgba(255,255,255,0.06);
    --border-hover: rgba(255,255,255,0.12);
    --text-primary: #f0f0f5;
    --text-secondary: #8888a0;
    --text-muted: #55556a;
    --accent-purple: #8b5cf6;
    --accent-blue: #3b82f6;
    --accent-pink: #ec4899;
    --accent-green: #10b981;
    --gradient-primary: linear-gradient(135deg, #8b5cf6, #ec4899);
    --gradient-secondary: linear-gradient(135deg, #3b82f6, #8b5cf6);
    --gradient-glow: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15));
    --shadow-card: 0 4px 24px rgba(0,0,0,0.3);
    --shadow-elevated: 0 8px 40px rgba(0,0,0,0.4);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
  }
  
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; }
  
  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
  
  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  
  .fade-in { animation: fadeIn 0.5s ease forwards; }
  .slide-up { animation: slideUp 0.6s ease forwards; }
  
  .stagger-1 { animation-delay: 0.1s; opacity: 0; }
  .stagger-2 { animation-delay: 0.2s; opacity: 0; }
  .stagger-3 { animation-delay: 0.3s; opacity: 0; }
  .stagger-4 { animation-delay: 0.4s; opacity: 0; }
  .stagger-5 { animation-delay: 0.5s; opacity: 0; }
  .stagger-6 { animation-delay: 0.6s; opacity: 0; }

  /* Noise overlay */
  .noise-bg::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }
`;

// ============================================================
// COMPONENTS
// ============================================================

// --- Avatar ---
function Avatar({ name, size = 48, src, className = "" }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} className={className} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: getAvatarColor(name || "U"),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, color: "white", fontFamily: "'Outfit', sans-serif",
      flexShrink: 0
    }} className={className}>
      {getInitials(name || "User")}
    </div>
  );
}

// --- Badge ---
function Badge({ children, variant = "default" }) {
  const variants = {
    default: { background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" },
    pink: { background: "rgba(236,72,153,0.15)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.2)" },
    blue: { background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" },
    green: { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" },
  };
  return (
    <span style={{
      ...variants[variant], padding: "4px 10px", borderRadius: 20, fontSize: 11,
      fontWeight: 600, letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 4
    }}>
      {children}
    </span>
  );
}

// --- Button ---
function Button({ children, onClick, variant = "primary", size = "md", fullWidth, disabled, style: extraStyle, ...props }) {
  const base = {
    fontFamily: "'Outfit', sans-serif", fontWeight: 600, borderRadius: var(--radius-md) ? 12 : 12,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", display: "inline-flex",
    alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s ease",
    opacity: disabled ? 0.5 : 1, width: fullWidth ? "100%" : "auto", letterSpacing: "0.01em",
    borderRadius: 12,
  };
  const sizes = {
    sm: { padding: "8px 16px", fontSize: 13 },
    md: { padding: "12px 24px", fontSize: 14 },
    lg: { padding: "16px 32px", fontSize: 16 },
  };
  const variants = {
    primary: { background: "var(--gradient-primary)", color: "white", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" },
    secondary: { background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-color)" },
    ghost: { background: "transparent", color: "var(--text-secondary)" },
    outline: { background: "transparent", color: "var(--accent-purple)", border: "1px solid var(--accent-purple)" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
      onMouseEnter={e => { if (!disabled) { e.target.style.transform = "translateY(-1px)"; e.target.style.filter = "brightness(1.1)"; }}}
      onMouseLeave={e => { e.target.style.transform = ""; e.target.style.filter = ""; }}
      {...props}
    >
      {children}
    </button>
  );
}

// --- Input ---
function Input({ label, icon, error, style: extraStyle, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>{icon}</span>}
        <input {...props} style={{
          width: "100%", padding: icon ? "12px 16px 12px 42px" : "12px 16px",
          background: "var(--bg-secondary)", border: `1px solid ${error ? "#ef4444" : "var(--border-color)"}`,
          borderRadius: 10, color: "var(--text-primary)", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "border-color 0.2s", ...extraStyle
        }}
        onFocus={e => e.target.style.borderColor = "var(--accent-purple)"}
        onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "var(--border-color)"}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

// --- Select ---
function Select({ label, options, value, onChange, placeholder, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>{label}</label>}
      <select value={value} onChange={onChange} style={{
        width: "100%", padding: "12px 16px", background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)", borderRadius: 10, color: "var(--text-primary)",
        fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer",
        appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238888a0' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
      }} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
      </select>
    </div>
  );
}

// --- Textarea ---
function Textarea({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>{label}</label>}
      <textarea {...props} style={{
        width: "100%", padding: "12px 16px", background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)", borderRadius: 10, color: "var(--text-primary)",
        fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical",
        minHeight: 100, transition: "border-color 0.2s", ...props.style
      }}
      onFocus={e => e.target.style.borderColor = "var(--accent-purple)"}
      onBlur={e => e.target.style.borderColor = "var(--border-color)"}
      />
    </div>
  );
}

// --- Range Slider ---
function RangeSlider({ label, min = 0, max = 100, value, onChange, suffix = "", step = 1 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-purple)" }}>{typeof value === "object" ? `${value[0]}${suffix} – ${value[1]}${suffix}` : `${value}${suffix}`}</span>
      </div>
      {typeof value === "object" ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="range" min={min} max={max} step={step} value={value[0]} onChange={e => onChange([parseInt(e.target.value), value[1]])}
            style={{ flex: 1, accentColor: "var(--accent-purple)", height: 4 }} />
          <input type="range" min={min} max={max} step={step} value={value[1]} onChange={e => onChange([value[0], parseInt(e.target.value)])}
            style={{ flex: 1, accentColor: "var(--accent-purple)", height: 4 }} />
        </div>
      ) : (
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent-purple)", height: 4 }} />
      )}
    </div>
  );
}

// --- Multi Select ---
function MultiSelect({ label, options, selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>{label}</label>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
            border: selected.includes(opt) ? "1px solid var(--accent-purple)" : "1px solid var(--border-color)",
            background: selected.includes(opt) ? "rgba(139,92,246,0.15)" : "var(--bg-secondary)",
            color: selected.includes(opt) ? "var(--accent-purple)" : "var(--text-secondary)",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Stat Card ---
function StatCard({ icon, label, value, color = "var(--accent-purple)" }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14,
      padding: "16px 20px", display: "flex", alignItems: "center", gap: 14
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}15`, color: color
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{value}</div>
      </div>
    </div>
  );
}

// --- Influencer Card ---
function InfluencerCard({ influencer, onClick, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="slide-up"
      style={{
        background: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--border-hover)" : "var(--border-color)"}`,
        borderRadius: 18, padding: 0, cursor: "pointer", transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 40px rgba(139,92,246,0.12)" : "var(--shadow-card)",
        animationDelay: `${delay}s`, opacity: 0, overflow: "hidden"
      }}
    >
      {/* Gradient top bar */}
      <div style={{ height: 3, background: "var(--gradient-primary)" }} />
      
      <div style={{ padding: "24px 24px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <Avatar name={influencer.name} size={52} src={influencer.avatar} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 16 }}>{influencer.name}</span>
              {influencer.verified && <span style={{ color: "var(--accent-purple)" }}><Icons.Check /></span>}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Instagram /> {influencer.username}
            </div>
          </div>
          <Badge>{influencer.niche}</Badge>
        </div>

        {/* Bio */}
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {influencer.bio}
        </p>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-secondary)", borderRadius: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{formatFollowers(influencer.followers)}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Følgere</div>
          </div>
          <div style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-secondary)", borderRadius: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "var(--accent-green)" }}>{influencer.engagement_rate}%</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Engasjement</div>
          </div>
          <div style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-secondary)", borderRadius: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{influencer.gender_distribution.female}%</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Kvinner</div>
          </div>
        </div>

        {/* Location */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
          <Icons.MapPin /> {influencer.city}, {influencer.country}
        </div>
      </div>
    </div>
  );
}

// --- Navigation ---
function Navigation({ currentPage, setPage, user, setUser, unreadCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navLinks = user ? (
    user.type === "business" ? [
      { id: "home", label: "Hjem", icon: <Icons.Home /> },
      { id: "discover", label: "Oppdag", icon: <Icons.Search /> },
      { id: "messages", label: "Meldinger", icon: <Icons.Mail />, badge: unreadCount },
      { id: "company-profile", label: "Profil", icon: <Icons.Building /> },
    ] : [
      { id: "home", label: "Hjem", icon: <Icons.Home /> },
      { id: "dashboard", label: "Dashboard", icon: <Icons.BarChart /> },
      { id: "messages", label: "Meldinger", icon: <Icons.Mail />, badge: unreadCount },
    ]
  ) : [];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px) saturate(1.5)",
      borderBottom: "1px solid var(--border-color)", padding: "0 24px"
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
            fontSize: 18, fontFamily: "'Outfit', sans-serif", color: "white"
          }}>
            C
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>
            Cre<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>8</span>or
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => setPage(link.id)} style={{
              background: currentPage === link.id ? "rgba(139,92,246,0.1)" : "transparent",
              border: "none", color: currentPage === link.id ? "var(--accent-purple)" : "var(--text-secondary)",
              padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", position: "relative",
              fontFamily: "'DM Sans', sans-serif"
            }}>
              {link.icon} {link.label}
              {link.badge > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 4, width: 18, height: 18, borderRadius: "50%",
                  background: "var(--accent-pink)", color: "white", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{link.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={user.name} size={32} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{user.name}</span>
              </div>
              <button onClick={() => { setUser(null); setPage("home"); }} style={{
                background: "transparent", border: "none", color: "var(--text-muted)",
                cursor: "pointer", padding: 8, borderRadius: 8, display: "flex", alignItems: "center"
              }}><Icons.Logout /></button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setPage("login")}>Logg inn</Button>
              <Button size="sm" onClick={() => setPage("register")}>Kom i gang</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// PAGES
// ============================================================

// --- Landing Page ---
function LandingPage({ setPage }) {
  return (
    <div className="noise-bg">
      {/* Hero */}
      <section style={{
        minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "80px 24px 60px", position: "relative",
        overflow: "hidden"
      }}>
        {/* Background orbs */}
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.06), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        
        <div className="fade-in" style={{ position: "relative", zIndex: 1 }}>
          <Badge variant="pink"><Icons.Zap /> Norges influencer-markedsplass</Badge>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.05, marginTop: 24, marginBottom: 20,
            letterSpacing: "-0.03em", maxWidth: 800
          }}>
            Koble <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>influencere</span> med <span style={{ background: "var(--gradient-secondary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>bedrifter</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Data-drevet matching. Finn de perfekte influencerne basert på demografi, engasjement og målgruppe.
          </p>
          
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Button size="lg" onClick={() => setPage("register")} style={{ minWidth: 260 }}>
              Jeg er influencer – Registrer deg <Icons.ArrowRight />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setPage("register")} style={{ minWidth: 260 }}>
              <Icons.Building /> Jeg er bedrift – Kom i gang
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="slide-up" style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 60, letterSpacing: "-0.02em" }}>
          Hvordan det fungerer
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, marginBottom: 60 }}>
          {/* Influencer flow */}
          <div className="slide-up stagger-1">
            <Badge variant="pink">For influencere</Badge>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { step: "01", title: "Opprett profil", desc: "Registrer deg og fyll ut profilen din med statistikk og demografisk data." },
                { step: "02", title: "Vis deg frem", desc: "Din profil vises i markedsplassen for bedrifter som søker influencere." },
                { step: "03", title: "Motta henvendelser", desc: "Bedrifter kontakter deg direkte gjennom meldingssystemet." },
              ].map(item => (
                <div key={item.step} style={{ display: "flex", gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: "rgba(236,72,153,0.1)",
                    color: "var(--accent-pink)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0
                  }}>{item.step}</div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{item.title}</h4>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Business flow */}
          <div className="slide-up stagger-2">
            <Badge variant="blue">For bedrifter</Badge>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { step: "01", title: "Registrer bedriften", desc: "Opprett en bedriftsprofil med firmanavn, bransje og logo." },
                { step: "02", title: "Søk og filtrer", desc: "Bruk avanserte filtre for å finne influencere som matcher din målgruppe." },
                { step: "03", title: "Ta kontakt", desc: "Send melding direkte til influencere du ønsker å samarbeide med." },
              ].map(item => (
                <div key={item.step} style={{ display: "flex", gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.1)",
                    color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0
                  }}>{item.step}</div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{item.title}</h4>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section style={{ padding: "40px 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 className="slide-up" style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
          Utforsk profiler
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 48, fontSize: 16 }}>
          Se hvordan influencer-profiler ser ut på Cre8or
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {MOCK_INFLUENCERS.slice(0, 4).map((inf, i) => (
            <InfluencerCard key={inf.id} influencer={inf} delay={i * 0.12} onClick={() => setPage(`profile-${inf.id}`)} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: "0 24px 80px", padding: "60px 40px", borderRadius: 24,
        background: "var(--gradient-glow)", border: "1px solid var(--border-color)",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08), transparent)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, position: "relative" }}>Klar til å starte?</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 16, position: "relative" }}>Bli med tusenvis av influencere og bedrifter på Cre8or</p>
        <Button size="lg" onClick={() => setPage("register")} style={{ position: "relative" }}>Registrer deg nå <Icons.ArrowRight /></Button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-color)", padding: "40px 24px",
        maxWidth: 1200, margin: "0 auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
              fontSize: 16, fontFamily: "'Outfit', sans-serif", color: "white"
            }}>C</div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 16 }}>Cre8or</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--text-muted)" }}>
            <span style={{ cursor: "pointer" }}>Om oss</span>
            <span style={{ cursor: "pointer" }}>Vilkår</span>
            <span style={{ cursor: "pointer" }}>Personvern</span>
            <span style={{ cursor: "pointer" }}>Kontakt</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>&copy; 2026 Cre8or. Alle rettigheter reservert.</div>
        </div>
      </footer>
    </div>
  );
}

// --- Register Page ---
function RegisterPage({ setPage, setUser }) {
  const [step, setStep] = useState(0); // 0=choose type, 1=form
  const [userType, setUserType] = useState(null);
  const [form, setForm] = useState({
    email: "", password: "", name: "", bio: "", instagram: "",
    age: "", city: "", country: "", niche: "",
    followers: "", avg_likes: "", avg_comments: "",
    age_13_17: "", age_18_24: "", age_25_34: "", age_35_44: "", age_45: "",
    gender_female: "", gender_male: "",
    market1_city: "", market1_country: "",
    market2_city: "", market2_country: "",
    market3_city: "", market3_country: "",
    company_name: "", industry: "", description: "",
  });
  const [engagementRate, setEngagementRate] = useState(null);

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const calcEngagement = () => {
    const likes = parseInt(form.avg_likes) || 0;
    const comments = parseInt(form.avg_comments) || 0;
    const followers = parseInt(form.followers) || 1;
    const rate = ((likes + comments) / followers * 100).toFixed(2);
    setEngagementRate(rate);
  };

  const handleRegister = () => {
    const mockUser = userType === "influencer" ? {
      id: "new-inf", type: "influencer", name: form.name || "Ny Influencer",
      email: form.email, username: form.instagram, bio: form.bio,
      city: form.city, country: form.country, age: parseInt(form.age),
      niche: form.niche, followers: parseInt(form.followers) || 0,
      engagement_rate: parseFloat(engagementRate) || 0,
      age_distribution: {
        "13-17": parseInt(form.age_13_17) || 0, "18-24": parseInt(form.age_18_24) || 0,
        "25-34": parseInt(form.age_25_34) || 0, "35-44": parseInt(form.age_35_44) || 0, "45+": parseInt(form.age_45) || 0
      },
      gender_distribution: { female: parseInt(form.gender_female) || 50, male: parseInt(form.gender_male) || 50 },
      top_markets: [
        { city: form.market1_city, country: form.market1_country },
        { city: form.market2_city, country: form.market2_country },
        { city: form.market3_city, country: form.market3_country },
      ].filter(m => m.city),
    } : {
      id: "company1", type: "business", name: form.company_name || "Ny Bedrift",
      email: form.email, industry: form.industry, description: form.description,
    };
    setUser(mockUser);
    setPage(userType === "influencer" ? "dashboard" : "discover");
  };

  if (step === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="fade-in" style={{ maxWidth: 600, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em" }}>Velkommen til Cre8or</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 48, fontSize: 16 }}>Hva beskriver deg best?</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { type: "influencer", icon: <Icons.User />, title: "Influencer", desc: "Jeg skaper innhold og vil vise profilen min til bedrifter", color: "var(--accent-pink)" },
              { type: "business", icon: <Icons.Building />, title: "Bedrift", desc: "Jeg leter etter influencere å samarbeide med", color: "var(--accent-blue)" },
            ].map(opt => (
              <button key={opt.type} onClick={() => { setUserType(opt.type); setStep(1); }} style={{
                background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 18,
                padding: 32, cursor: "pointer", transition: "all 0.3s", textAlign: "center"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = ""; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${opt.color}15`, color: opt.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>{opt.icon}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>{opt.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
          
          <p style={{ marginTop: 32, fontSize: 14, color: "var(--text-muted)" }}>
            Har allerede en konto? <span onClick={() => setPage("login")} style={{ color: "var(--accent-purple)", cursor: "pointer", fontWeight: 500 }}>Logg inn</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div className="fade-in" style={{ maxWidth: 640, width: "100%" }}>
        <button onClick={() => setStep(0)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 4 }}>
          ← Tilbake
        </button>
        
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {userType === "influencer" ? "Opprett influencer-profil" : "Registrer bedrift"}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 36, fontSize: 15 }}>
          {userType === "influencer" ? "Fyll ut profilen din slik at bedrifter kan finne deg" : "Opprett din bedriftskonto for å finne influencere"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Common fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="E-post" type="email" value={form.email} onChange={e => updateForm("email", e.target.value)} placeholder="din@epost.no" />
            <Input label="Passord" type="password" value={form.password} onChange={e => updateForm("password", e.target.value)} placeholder="Minst 8 tegn" />
          </div>

          {userType === "influencer" ? (
            <>
              {/* Influencer-specific fields */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Personlig info</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Input label="Fullt navn" value={form.name} onChange={e => updateForm("name", e.target.value)} placeholder="Ditt navn" />
                  <Input label="Instagram-brukernavn" value={form.instagram} onChange={e => updateForm("instagram", e.target.value)} placeholder="@brukernavn" />
                </div>
                <Textarea label="Bio" value={form.bio} onChange={e => updateForm("bio", e.target.value)} placeholder="Kort om deg selv..." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
                  <Input label="Alder" type="number" value={form.age} onChange={e => updateForm("age", e.target.value)} placeholder="25" />
                  <Input label="By" value={form.city} onChange={e => updateForm("city", e.target.value)} placeholder="Oslo" />
                  <Input label="Land" value={form.country} onChange={e => updateForm("country", e.target.value)} placeholder="Norge" />
                </div>
                <div style={{ marginTop: 16 }}>
                  <Select label="Nisje/kategori" options={NICHES} value={form.niche} onChange={e => updateForm("niche", e.target.value)} placeholder="Velg kategori" />
                </div>
              </div>

              {/* Stats */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Statistikk</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Input label="Følgerantall" type="number" value={form.followers} onChange={e => { updateForm("followers", e.target.value); }} placeholder="124000" />
                  <Input label="Snitt likes" type="number" value={form.avg_likes} onChange={e => updateForm("avg_likes", e.target.value)} placeholder="5200" />
                  <Input label="Snitt kommentarer" type="number" value={form.avg_comments} onChange={e => updateForm("avg_comments", e.target.value)} placeholder="340" />
                </div>
                
                {/* Engagement calculator */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Engasjementsrate-kalkulator</span>
                    <Button size="sm" variant="outline" onClick={calcEngagement}>Beregn</Button>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Formel: (snitt likes + snitt kommentarer) / følgere × 100</p>
                  {engagementRate && (
                    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "var(--accent-green)" }}>
                      {engagementRate}%
                    </div>
                  )}
                </div>

                {/* Age distribution */}
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Aldersfordeling på følgere (%)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
                  {[["13-17", "age_13_17"], ["18-24", "age_18_24"], ["25-34", "age_25_34"], ["35-44", "age_35_44"], ["45+", "age_45"]].map(([label, key]) => (
                    <Input key={key} label={label} type="number" value={form[key]} onChange={e => updateForm(key, e.target.value)} placeholder="%" style={{ textAlign: "center" }} />
                  ))}
                </div>

                {/* Gender distribution */}
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Kjønnsfordeling (%)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <Input label="Kvinner" type="number" value={form.gender_female} onChange={e => updateForm("gender_female", e.target.value)} placeholder="60" />
                  <Input label="Menn" type="number" value={form.gender_male} onChange={e => updateForm("gender_male", e.target.value)} placeholder="40" />
                </div>

                {/* Top markets */}
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Topp 3 geografiske markeder</h4>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                    <Input label={`Marked ${i} – by`} value={form[`market${i}_city`]} onChange={e => updateForm(`market${i}_city`, e.target.value)} placeholder="By" />
                    <Input label={`Marked ${i} – land`} value={form[`market${i}_country`]} onChange={e => updateForm(`market${i}_country`, e.target.value)} placeholder="Land" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Business-specific fields */}
              <Input label="Firmanavn" value={form.company_name} onChange={e => updateForm("company_name", e.target.value)} placeholder="Bedriftens navn" />
              <Input label="Bransje" value={form.industry} onChange={e => updateForm("industry", e.target.value)} placeholder="F.eks. Mote, Teknologi, Mat..." />
              <Textarea label="Beskrivelse" value={form.description} onChange={e => updateForm("description", e.target.value)} placeholder="Beskriv bedriften din..." />
            </>
          )}

          <Button fullWidth size="lg" onClick={handleRegister} style={{ marginTop: 16 }}>
            Opprett konto
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Login Page ---
function LoginPage({ setPage, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Demo: log in as either type
    setUser({
      id: "company1", type: "business", name: "NordicBrand AS",
      email: email || "demo@bedrift.no", industry: "Mote", description: "Norsk motebedrift"
    });
    setPage("discover");
  };

  const handleInfluencerLogin = () => {
    setUser({
      ...MOCK_INFLUENCERS[0], type: "influencer"
    });
    setPage("dashboard");
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-in" style={{ maxWidth: 420, width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 20, padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: "center", letterSpacing: "-0.02em" }}>Velkommen tilbake</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, textAlign: "center", fontSize: 15 }}>Logg inn på din konto</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="E-post" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@epost.no" icon={<Icons.Mail />} />
          <Input label="Passord" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ditt passord" />
          <Button fullWidth size="lg" onClick={handleLogin} style={{ marginTop: 8 }}>Logg inn som bedrift</Button>
          <Button fullWidth size="lg" variant="secondary" onClick={handleInfluencerLogin}>Logg inn som influencer (demo)</Button>
        </div>
        
        <p style={{ marginTop: 24, fontSize: 14, color: "var(--text-muted)", textAlign: "center" }}>
          Ingen konto? <span onClick={() => setPage("register")} style={{ color: "var(--accent-purple)", cursor: "pointer", fontWeight: 500 }}>Registrer deg</span>
        </p>
      </div>
    </div>
  );
}

// --- Discover Page (Business) ---
function DiscoverPage({ setPage }) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    niches: [], followersRange: [0, 500000], minEngagement: 0,
    ageRange: [18, 45], minAge18_24: 0, minAge25_34: 0,
    minFemale: 0, city: "", country: "", marketCountry: ""
  });

  const filtered = MOCK_INFLUENCERS.filter(inf => {
    if (search && !inf.name.toLowerCase().includes(search.toLowerCase()) && !inf.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.niches.length > 0 && !filters.niches.includes(inf.niche)) return false;
    if (inf.followers < filters.followersRange[0] || inf.followers > filters.followersRange[1]) return false;
    if (inf.engagement_rate < filters.minEngagement) return false;
    if (inf.age < filters.ageRange[0] || inf.age > filters.ageRange[1]) return false;
    if (inf.age_distribution["18-24"] < filters.minAge18_24) return false;
    if (inf.age_distribution["25-34"] < filters.minAge25_34) return false;
    if (inf.gender_distribution.female < filters.minFemale) return false;
    if (filters.city && !inf.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.country && !inf.country.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.marketCountry && !inf.top_markets.some(m => m.country.toLowerCase().includes(filters.marketCountry.toLowerCase()))) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-in">
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Oppdag influencere</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 15 }}>Finn de perfekte influencerne for din merkevare</p>
      </div>

      {/* Search & filter bar */}
      <div className="fade-in" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <Input icon={<Icons.Search />} placeholder="Søk etter navn eller brukernavn..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant={showFilters ? "primary" : "secondary"} onClick={() => setShowFilters(!showFilters)}>
          <Icons.Filter /> Filtre {showFilters ? "▲" : "▼"}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="fade-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 18,
          padding: 28, marginBottom: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24
        }}>
          <MultiSelect label="Nisje/kategori" options={NICHES} selected={filters.niches} onChange={v => setFilters(p => ({ ...p, niches: v }))} />
          <RangeSlider label="Følgerantall" min={0} max={500000} step={5000} value={filters.followersRange} onChange={v => setFilters(p => ({ ...p, followersRange: v }))} />
          <RangeSlider label="Min. engasjementsrate" min={0} max={15} step={0.5} value={filters.minEngagement} onChange={v => setFilters(p => ({ ...p, minEngagement: v }))} suffix="%" />
          <RangeSlider label="Influencerens alder" min={13} max={65} value={filters.ageRange} onChange={v => setFilters(p => ({ ...p, ageRange: v }))} suffix=" år" />
          <RangeSlider label="Min. % følgere 18–24" min={0} max={100} value={filters.minAge18_24} onChange={v => setFilters(p => ({ ...p, minAge18_24: v }))} suffix="%" />
          <RangeSlider label="Min. % følgere 25–34" min={0} max={100} value={filters.minAge25_34} onChange={v => setFilters(p => ({ ...p, minAge25_34: v }))} suffix="%" />
          <RangeSlider label="Min. % kvinner" min={0} max={100} value={filters.minFemale} onChange={v => setFilters(p => ({ ...p, minFemale: v }))} suffix="%" />
          <Input label="Influencerens by" value={filters.city} onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} placeholder="F.eks. Oslo" />
          <Input label="Influencerens land" value={filters.country} onChange={e => setFilters(p => ({ ...p, country: e.target.value }))} placeholder="F.eks. Norge" />
          <Input label="Følgernes hovedmarked (land)" value={filters.marketCountry} onChange={e => setFilters(p => ({ ...p, marketCountry: e.target.value }))} placeholder="F.eks. Norge" />
        </div>
      )}

      {/* Results */}
      <div style={{ marginBottom: 16, fontSize: 14, color: "var(--text-muted)" }}>{filtered.length} influencere funnet</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {filtered.map((inf, i) => (
          <InfluencerCard key={inf.id} influencer={inf} delay={i * 0.08} onClick={() => setPage(`profile-${inf.id}`)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
          <Icons.Search />
          <p style={{ marginTop: 12, fontSize: 16 }}>Ingen influencere matcher filtrene dine</p>
          <p style={{ fontSize: 14 }}>Prøv å justere filtrene for bredere resultater</p>
        </div>
      )}
    </div>
  );
}

// --- Profile Page ---
function ProfilePage({ influencerId, setPage, user }) {
  const influencer = MOCK_INFLUENCERS.find(i => i.id === influencerId) || MOCK_INFLUENCERS[0];
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const sendMessage = () => {
    setMessageSent(true);
    setTimeout(() => { setShowMessageModal(false); setMessageSent(false); setMessage(""); }, 2000);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={() => setPage("discover")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 4 }}>← Tilbake til søk</button>
      
      <div className="fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 22, overflow: "hidden" }}>
        {/* Header gradient */}
        <div style={{ height: 120, background: "var(--gradient-primary)", position: "relative" }}>
          <div style={{ position: "absolute", bottom: -40, left: 32 }}>
            <Avatar name={influencer.name} size={80} src={influencer.avatar} />
          </div>
        </div>
        
        <div style={{ padding: "56px 32px 32px" }}>
          {/* Name & badges */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{influencer.name}</h1>
                {influencer.verified && <span style={{ color: "var(--accent-purple)" }}><Icons.Check /></span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, color: "var(--text-secondary)", fontSize: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.Instagram /> {influencer.username}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icons.MapPin /> {influencer.city}, {influencer.country}</span>
                <Badge>{influencer.niche}</Badge>
              </div>
            </div>
            {user?.type === "business" && (
              <Button onClick={() => setShowMessageModal(true)}>
                <Icons.Mail /> Send melding
              </Button>
            )}
          </div>

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28, fontSize: 15 }}>{influencer.bio}</p>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard icon={<Icons.Users />} label="Følgere" value={formatFollowers(influencer.followers)} />
            <StatCard icon={<Icons.Heart />} label="Engasjement" value={`${influencer.engagement_rate}%`} color="var(--accent-green)" />
            <StatCard icon={<Icons.User />} label="Alder" value={`${influencer.age} år`} color="var(--accent-blue)" />
          </div>

          {/* Demographics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {/* Age distribution */}
            <div style={{ background: "var(--bg-secondary)", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Aldersfordeling</h3>
              {Object.entries(influencer.age_distribution).map(([age, pct]) => (
                <div key={age} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{age}</span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-primary)", borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Gender distribution */}
            <div style={{ background: "var(--bg-secondary)", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Kjønnsfordeling</h3>
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, borderRadius: 6, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${influencer.gender_distribution.female}%`, background: "var(--accent-pink)", transition: "width 0.8s ease" }} />
                    <div style={{ width: `${influencer.gender_distribution.male}%`, background: "var(--accent-blue)", transition: "width 0.8s ease" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--accent-pink)" }} />
                  <span style={{ fontSize: 14 }}>Kvinner: <strong>{influencer.gender_distribution.female}%</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--accent-blue)" }} />
                  <span style={{ fontSize: 14 }}>Menn: <strong>{influencer.gender_distribution.male}%</strong></span>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 16 }}>Topp markeder</h3>
              {influencer.top_markets.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", background: "var(--bg-card)", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "var(--accent-purple)", fontFamily: "'Outfit', sans-serif" }}>{i + 1}</span>
                  <Icons.Globe />
                  <span style={{ fontSize: 14 }}>{m.city}, {m.country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24,
          backdropFilter: "blur(4px)"
        }} onClick={() => setShowMessageModal(false)}>
          <div className="fade-in" style={{
            background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 20,
            padding: 32, maxWidth: 480, width: "100%"
          }} onClick={e => e.stopPropagation()}>
            {messageSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Melding sendt!</h3>
                <p style={{ color: "var(--text-secondary)" }}>Din melding til {influencer.name} er sendt</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600 }}>Send melding til {influencer.name}</h3>
                  <button onClick={() => setShowMessageModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><Icons.X /></button>
                </div>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Skriv din melding her..." style={{ minHeight: 140 }} />
                <Button fullWidth size="lg" onClick={sendMessage} style={{ marginTop: 16 }} disabled={!message.trim()}>
                  <Icons.Send /> Send melding
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Dashboard (Influencer) ---
function DashboardPage({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "", bio: user?.bio || "", instagram: user?.username || "",
    followers: user?.followers?.toString() || "", engagement_rate: user?.engagement_rate?.toString() || "",
    city: user?.city || "", country: user?.country || "", age: user?.age?.toString() || "",
  });

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Administrer profilen din</p>
        </div>
        <Button variant={editing ? "primary" : "secondary"} onClick={() => {
          if (editing) {
            setUser(prev => ({ ...prev, name: form.name, bio: form.bio, username: form.instagram,
              followers: parseInt(form.followers) || prev.followers,
              engagement_rate: parseFloat(form.engagement_rate) || prev.engagement_rate,
              city: form.city, country: form.country, age: parseInt(form.age) || prev.age
            }));
          }
          setEditing(!editing);
        }}>
          {editing ? "Lagre endringer" : "Rediger profil"}
        </Button>
      </div>

      {/* Stats overview */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon={<Icons.Users />} label="Følgere" value={formatFollowers(user?.followers || 0)} />
        <StatCard icon={<Icons.Heart />} label="Engasjement" value={`${user?.engagement_rate || 0}%`} color="var(--accent-green)" />
        <StatCard icon={<Icons.Mail />} label="Meldinger" value="3" color="var(--accent-pink)" />
        <StatCard icon={<Icons.Globe />} label="Profil-visninger" value="1.2K" color="var(--accent-blue)" />
      </div>

      {/* Profile card */}
      <div className="fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 18, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <Avatar name={user?.name || "U"} size={72} />
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{user?.name}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{user?.username} · {user?.city}, {user?.country}</p>
          </div>
        </div>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Navn" value={form.name} onChange={e => updateForm("name", e.target.value)} />
              <Input label="Instagram" value={form.instagram} onChange={e => updateForm("instagram", e.target.value)} />
            </div>
            <Textarea label="Bio" value={form.bio} onChange={e => updateForm("bio", e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Input label="Følgere" type="number" value={form.followers} onChange={e => updateForm("followers", e.target.value)} />
              <Input label="Engasjementsrate (%)" type="number" value={form.engagement_rate} onChange={e => updateForm("engagement_rate", e.target.value)} />
              <Input label="Alder" type="number" value={form.age} onChange={e => updateForm("age", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="By" value={form.city} onChange={e => updateForm("city", e.target.value)} />
              <Input label="Land" value={form.country} onChange={e => updateForm("country", e.target.value)} />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>{user?.bio || "Ingen bio lagt til ennå."}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Badge>{user?.niche || "Ingen kategori"}</Badge>
              <Badge variant="green">{user?.engagement_rate}% engasjement</Badge>
              <Badge variant="blue">{formatFollowers(user?.followers || 0)} følgere</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Messages Page ---
function MessagesPage({ user }) {
  const [conversations] = useState([
    { id: "c1", name: "NordicBrand AS", lastMessage: "Hei! Vi vil gjerne samarbeide med deg.", time: "14:30", unread: 1, type: "business" },
    { id: "c2", name: "FitNorge", lastMessage: "Har du tid til et møte neste uke?", time: "I går", unread: 0, type: "business" },
    { id: "c3", name: "TechReview NO", lastMessage: "Takk for svar! Vi sender brief.", time: "Man", unread: 2, type: "business" },
  ]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, from: "NordicBrand AS", content: "Hei Sara! Vi er et norsk motebrand som er interessert i et samarbeid med deg. Vi lanserer en ny kolleksjon i april og tror du ville vært perfekt som ambassadør.", time: "14:30", self: false },
    { id: 2, from: "Sara Nordvik", content: "Hei! Høres veldig spennende ut! Fortell gjerne mer om hva dere ser for dere?", time: "15:00", self: true },
    { id: 3, from: "NordicBrand AS", content: "Vi tenker 3 Instagram-poster + stories over 2 uker. Vi sender produkter og tilbyr også kompensasjon. Kan vi ta et møte?", time: "15:15", self: false },
  ]);
  const [newMsg, setNewMsg] = useState("");

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), from: user?.name || "Du", content: newMsg, time: new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }), self: true
    }]);
    setNewMsg("");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", height: "calc(100vh - 96px)" }}>
      <h1 className="fade-in" style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>Meldinger</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 0, height: "calc(100% - 60px)", background: "var(--bg-card)", borderRadius: 18, overflow: "hidden", border: "1px solid var(--border-color)" }}>
        {/* Conversation list */}
        <div style={{ borderRight: "1px solid var(--border-color)", overflowY: "auto" }}>
          {conversations.map(convo => (
            <div key={convo.id} onClick={() => setActiveConvo(convo.id)}
              style={{
                padding: "16px 20px", cursor: "pointer", transition: "all 0.15s",
                background: activeConvo === convo.id ? "rgba(139,92,246,0.08)" : "transparent",
                borderBottom: "1px solid var(--border-color)",
                borderLeft: activeConvo === convo.id ? "3px solid var(--accent-purple)" : "3px solid transparent"
              }}
              onMouseEnter={e => { if (activeConvo !== convo.id) e.currentTarget.style.background = "var(--bg-card-hover)"; }}
              onMouseLeave={e => { if (activeConvo !== convo.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={convo.name} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{convo.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{convo.time}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{convo.lastMessage}</span>
                    {convo.unread > 0 && (
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-purple)", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{convo.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message area */}
        {activeConvo ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Chat header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={conversations.find(c => c.id === activeConvo)?.name || ""} size={36} />
              <span style={{ fontWeight: 600 }}>{conversations.find(c => c.id === activeConvo)?.name}</span>
            </div>
            
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: "flex", justifyContent: msg.self ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "70%", padding: "12px 16px", borderRadius: 16,
                    background: msg.self ? "var(--accent-purple)" : "var(--bg-elevated)",
                    borderBottomRightRadius: msg.self ? 4 : 16,
                    borderBottomLeftRadius: msg.self ? 16 : 4,
                  }}>
                    <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                    <span style={{ fontSize: 11, color: msg.self ? "rgba(255,255,255,0.6)" : "var(--text-muted)", marginTop: 4, display: "block" }}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 12 }}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Skriv en melding..."
                style={{
                  flex: 1, padding: "12px 16px", background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)", borderRadius: 12,
                  color: "var(--text-primary)", fontSize: 14, outline: "none",
                  fontFamily: "'DM Sans', sans-serif"
                }}
              />
              <Button onClick={sendMessage} disabled={!newMsg.trim()}><Icons.Send /></Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexDirection: "column", gap: 12 }}>
            <Icons.Mail />
            <p>Velg en samtale for å begynne</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Company Profile Page ---
function CompanyProfilePage({ user }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ height: 100, background: "var(--gradient-secondary)" }} />
        <div style={{ padding: "32px", textAlign: "center", marginTop: -40 }}>
          <Avatar name={user?.name || "B"} size={80} />
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, letterSpacing: "-0.02em" }}>{user?.name}</h1>
          <Badge variant="blue">{user?.industry || "Bedrift"}</Badge>
          <p style={{ color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.6, maxWidth: 500, margin: "16px auto 0" }}>
            {user?.description || "Ingen beskrivelse lagt til ennå."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const unreadCount = 3;

  // Parse page for profile IDs
  const getPageContent = () => {
    if (page.startsWith("profile-")) {
      return <ProfilePage influencerId={page.replace("profile-", "")} setPage={setPage} user={user} />;
    }
    switch (page) {
      case "home": return <LandingPage setPage={setPage} />;
      case "register": return <RegisterPage setPage={setPage} setUser={setUser} />;
      case "login": return <LoginPage setPage={setPage} setUser={setUser} />;
      case "discover": return <DiscoverPage setPage={setPage} />;
      case "dashboard": return <DashboardPage user={user} setUser={setUser} />;
      case "messages": return <MessagesPage user={user} />;
      case "company-profile": return <CompanyProfilePage user={user} />;
      default: return <LandingPage setPage={setPage} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <Navigation currentPage={page} setPage={setPage} user={user} setUser={setUser} unreadCount={unreadCount} />
        <main>{getPageContent()}</main>
      </div>
    </>
  );
}
