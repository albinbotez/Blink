import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Badge } from '../components/ui'
import { Icons } from '../components/Icons'
import InfluencerCard from '../components/InfluencerCard'
import { supabase } from '../lib/supabase'

// Fallback mock data if DB is empty
const MOCK_INFLUENCERS = [
  {
    id: 'mock-1', name: 'Sara Nordvik', instagram_username: '@saranordvik',
    bio: 'Lifestyle & reise-entusiast fra Oslo. Deler hverdagsinspirasjoner og reisetips.',
    city: 'Oslo', country: 'Norge', age: 26, niche: 'Lifestyle',
    followers: 124000, engagement_rate: 4.8,
    audience_female: 78, is_verified: true,
  },
  {
    id: 'mock-2', name: 'Erik Johansen', instagram_username: '@erikjgaming',
    bio: 'Pro gamer & tech reviewer. Streamer og innholdsskaper.',
    city: 'Bergen', country: 'Norge', age: 23, niche: 'Gaming',
    followers: 89000, engagement_rate: 6.2,
    audience_female: 25, is_verified: false,
  },
  {
    id: 'mock-3', name: 'Mia Chen', instagram_username: '@miafoodie',
    bio: 'Matblogger & kokk. Fusjonmat og nordiske smaker.',
    city: 'Trondheim', country: 'Norge', age: 30, niche: 'Mat',
    followers: 210000, engagement_rate: 5.1,
    audience_female: 68, is_verified: true,
  },
  {
    id: 'mock-4', name: 'Amina Hassan', instagram_username: '@aminabeauty',
    bio: 'Makeup artist & skjønnhetsguru. Clean beauty-ambassadør.',
    city: 'Oslo', country: 'Norge', age: 24, niche: 'Skjønnhet',
    followers: 156000, engagement_rate: 5.8,
    audience_female: 92, is_verified: true,
  },
]

export default function LandingPage() {
  const [showcaseInfluencers, setShowcaseInfluencers] = useState(MOCK_INFLUENCERS)

  useEffect(() => {
    // Try to load real profiles from DB
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('followers', { ascending: false })
        .limit(4)
      if (data && data.length > 0) setShowcaseInfluencers(data)
    }
    load()
  }, [])

  return (
    <div className="noise-overlay">
      {/* ===== HERO ===== */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-accent-purple/[0.07] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-accent-pink/[0.05] blur-[80px] pointer-events-none" />

        <div className="relative z-10 animate-fade-in">
          <Badge variant="pink">
            <Icons.Zap /> Norges influencer-markedsplass
          </Badge>

          <h1 className="font-display font-extrabold text-[clamp(36px,6vw,72px)] leading-[1.05] mt-6 mb-5 tracking-tight max-w-[800px]">
            Koble{' '}
            <span className="gradient-text">influencere</span>{' '}
            med{' '}
            <span className="gradient-text-blue">bedrifter</span>
          </h1>

          <p className="text-lg text-txt-secondary max-w-[560px] mx-auto mb-10 leading-relaxed">
            Data-drevet matching. Finn de perfekte influencerne basert på demografi, engasjement og målgruppe.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register?type=influencer">
              <Button size="lg" className="min-w-[260px]">
                Jeg er influencer – Registrer deg <Icons.ArrowRight />
              </Button>
            </Link>
            <Link to="/register?type=business">
              <Button variant="secondary" size="lg" className="min-w-[260px]">
                <Icons.Building /> Jeg er bedrift – Kom i gang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-6 py-20 max-w-[1100px] mx-auto">
        <h2 className="text-center text-4xl font-display font-bold mb-16 tracking-tight animate-fade-in">
          Hvordan det fungerer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Influencer flow */}
          <div className="animate-fade-in">
            <Badge variant="pink">For influencere</Badge>
            <div className="mt-6 flex flex-col gap-6">
              {[
                { step: '01', title: 'Opprett profil', desc: 'Registrer deg og fyll ut profilen din med statistikk og demografisk data.' },
                { step: '02', title: 'Vis deg frem', desc: 'Din profil vises i markedsplassen for bedrifter som søker influencere.' },
                { step: '03', title: 'Motta henvendelser', desc: 'Bedrifter kontakter deg direkte gjennom meldingssystemet.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-accent-pink flex items-center justify-center font-display font-bold text-base flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">{item.title}</h4>
                    <p className="text-sm text-txt-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business flow */}
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <Badge variant="blue">For bedrifter</Badge>
            <div className="mt-6 flex flex-col gap-6">
              {[
                { step: '01', title: 'Registrer bedriften', desc: 'Opprett en bedriftsprofil med firmanavn, bransje og logo.' },
                { step: '02', title: 'Søk og filtrer', desc: 'Bruk avanserte filtre for å finne influencere som matcher din målgruppe.' },
                { step: '03', title: 'Ta kontakt', desc: 'Send melding direkte til influencere du ønsker å samarbeide med.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-accent-blue flex items-center justify-center font-display font-bold text-base flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">{item.title}</h4>
                    <p className="text-sm text-txt-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SHOWCASE ===== */}
      <section className="px-6 py-10 pb-24 max-w-[1200px] mx-auto">
        <h2 className="text-center text-4xl font-display font-bold mb-4 tracking-tight">
          Utforsk profiler
        </h2>
        <p className="text-center text-txt-secondary mb-12 text-base">
          Se hvordan influencer-profiler ser ut på Cre8or
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseInfluencers.map((inf, i) => (
            <InfluencerCard key={inf.id} influencer={inf} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-6 mb-20 p-12 md:p-16 rounded-3xl bg-gradient-to-br from-accent-purple/[0.08] to-accent-pink/[0.08] border border-white/[0.06] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent)] pointer-events-none" />
        <h2 className="text-3xl font-display font-bold mb-4 relative">Klar til å starte?</h2>
        <p className="text-txt-secondary mb-8 text-base relative">Bli med tusenvis av influencere og bedrifter på Cre8or</p>
        <Link to="/register" className="relative">
          <Button size="lg">Registrer deg nå <Icons.ArrowRight /></Button>
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.06] px-6 py-10 max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center font-display font-extrabold text-base text-white">C</div>
            <span className="font-display font-semibold text-base">Cre8or</span>
          </div>
          <div className="flex gap-6 text-sm text-txt-muted">
            <span className="cursor-pointer hover:text-txt-secondary transition-colors">Om oss</span>
            <span className="cursor-pointer hover:text-txt-secondary transition-colors">Vilkår</span>
            <span className="cursor-pointer hover:text-txt-secondary transition-colors">Personvern</span>
            <span className="cursor-pointer hover:text-txt-secondary transition-colors">Kontakt</span>
          </div>
          <div className="text-[13px] text-txt-muted">&copy; 2026 Cre8or. Alle rettigheter reservert.</div>
        </div>
      </footer>
    </div>
  )
}
