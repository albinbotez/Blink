# Cre8or – Influencer Marketplace

En fullstack influencer-markedsplass bygget med React, Tailwind CSS, og Supabase.

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (e-post/passord)
- **Fillagring:** Supabase Storage
- **Realtime:** Supabase Realtime (meldinger)
- **Hosting:** Vercel

## Mappestruktur
```
blink/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Icons.jsx          # SVG-ikoner
│   │   ├── InfluencerCard.jsx # Profilkort-komponent
│   │   ├── Navigation.jsx     # Navigasjonsbar
│   │   └── ui.jsx             # Gjenbrukbare UI-komponenter
│   ├── hooks/
│   │   ├── useAuth.jsx        # Autentisering + brukerprofil
│   │   └── useMessages.js     # Meldinger + realtime
│   ├── lib/
│   │   ├── supabase.js        # Supabase-klient
│   │   └── utils.js           # Hjelpefunksjoner
│   ├── pages/
│   │   ├── LandingPage.jsx    # /
│   │   ├── RegisterPage.jsx   # /register
│   │   ├── LoginPage.jsx      # /login
│   │   ├── DiscoverPage.jsx   # /discover
│   │   ├── ProfilePage.jsx    # /profile/:id
│   │   ├── DashboardPage.jsx  # /dashboard
│   │   ├── MessagesPage.jsx   # /messages
│   │   └── CompanyProfilePage.jsx # /company-profile
│   ├── App.jsx                # Routing + layout
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles + Tailwind
├── supabase/
│   └── migration.sql          # Database-oppsett
├── .env                       # Miljøvariabler (IKKE commit)
├── .env.example               # Mal for .env
├── vercel.json                # Vercel SPA-routing
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Oppsett

### 1. Kjør SQL-migrering i Supabase
1. Gå til [Supabase Dashboard](https://supabase.com/dashboard)
2. Åpne ditt prosjekt → **SQL Editor**
3. Lim inn hele innholdet fra `supabase/migration.sql`
4. Klikk **Run**

### 2. Sett miljøvariabler i Vercel
Gå til Vercel → ditt prosjekt → **Settings → Environment Variables**, og legg til:
- `VITE_SUPABASE_URL` = din Supabase URL
- `VITE_SUPABASE_ANON_KEY` = din Supabase anon key

### 3. Push til GitHub
```bash
cd blink
npm install
git add .
git commit -m "Cre8or influencer marketplace"
git push origin main
```

Vercel vil automatisk bygge og deploye.

### 4. Lokal utvikling
```bash
npm install
npm run dev
```

## Supabase URL Configuration
I Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://blink-gray.vercel.app`
- **Redirect URLs:** Legg til `https://blink-gray.vercel.app/**` og `http://localhost:5173/**`
