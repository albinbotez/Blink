import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Input, Button, MultiSelect, RangeSlider } from '../components/ui'
import { Icons } from '../components/Icons'
import InfluencerCard from '../components/InfluencerCard'
import { NICHES } from '../lib/utils'

export default function DiscoverPage() {
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    niches: [],
    followersRange: [0, 500000],
    minEngagement: 0,
    ageRange: [18, 65],
    minAge18_24: 0,
    minAge25_34: 0,
    minFemale: 0,
    city: '',
    country: '',
    marketCountry: '',
  })

  const sf = (key, val) => setFilters(p => ({ ...p, [key]: val }))

  useEffect(() => {
    loadInfluencers()
  }, [])

  async function loadInfluencers() {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('followers', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      setInfluencers(data || [])
    } catch (err) {
      console.error('Error loading influencers:', err)
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering (for real-time UX)
  const filtered = influencers.filter(inf => {
    if (search) {
      const s = search.toLowerCase()
      if (!inf.name?.toLowerCase().includes(s) &&
          !inf.instagram_username?.toLowerCase().includes(s) &&
          !inf.niche?.toLowerCase().includes(s)) return false
    }
    if (filters.niches.length > 0 && !filters.niches.includes(inf.niche)) return false
    if (inf.followers < filters.followersRange[0] || inf.followers > filters.followersRange[1]) return false
    if (inf.engagement_rate < filters.minEngagement) return false
    if (inf.age && (inf.age < filters.ageRange[0] || inf.age > filters.ageRange[1])) return false
    if ((inf.audience_age_18_24 || 0) < filters.minAge18_24) return false
    if ((inf.audience_age_25_34 || 0) < filters.minAge25_34) return false
    if ((inf.audience_female || 0) < filters.minFemale) return false
    if (filters.city && !inf.city?.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.country && !inf.country?.toLowerCase().includes(filters.country.toLowerCase())) return false
    if (filters.marketCountry) {
      try {
        const markets = typeof inf.top_markets === 'string' ? JSON.parse(inf.top_markets) : inf.top_markets
        if (!markets?.some(m => m.country?.toLowerCase().includes(filters.marketCountry.toLowerCase()))) return false
      } catch { return false }
    }
    return true
  })

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">Oppdag influencere</h1>
        <p className="text-txt-secondary mb-8 text-[15px]">Finn de perfekte influencerne for din merkevare</p>
      </div>

      {/* Search & filter toggle */}
      <div className="flex gap-3 mb-6 flex-wrap animate-fade-in">
        <div className="flex-1 min-w-[280px]">
          <Input icon={<Icons.Search />} placeholder="Søk etter navn, brukernavn eller nisje..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant={showFilters ? 'primary' : 'secondary'} onClick={() => setShowFilters(!showFilters)}>
          <Icons.Filter /> Filtre {showFilters ? '▲' : '▼'}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="animate-fade-in bg-bg-card border border-white/[0.06] rounded-[18px] p-7 mb-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MultiSelect label="Nisje/kategori" options={NICHES} selected={filters.niches} onChange={v => sf('niches', v)} />
          <RangeSlider label="Følgerantall" min={0} max={500000} step={5000} value={filters.followersRange} onChange={v => sf('followersRange', v)} />
          <RangeSlider label="Min. engasjementsrate" min={0} max={15} step={0.5} value={filters.minEngagement} onChange={v => sf('minEngagement', v)} suffix="%" />
          <RangeSlider label="Influencerens alder" min={13} max={65} value={filters.ageRange} onChange={v => sf('ageRange', v)} suffix=" år" />
          <RangeSlider label="Min. % følgere 18–24" min={0} max={100} value={filters.minAge18_24} onChange={v => sf('minAge18_24', v)} suffix="%" />
          <RangeSlider label="Min. % følgere 25–34" min={0} max={100} value={filters.minAge25_34} onChange={v => sf('minAge25_34', v)} suffix="%" />
          <RangeSlider label="Min. % kvinner" min={0} max={100} value={filters.minFemale} onChange={v => sf('minFemale', v)} suffix="%" />
          <Input label="Influencerens by" value={filters.city} onChange={e => sf('city', e.target.value)} placeholder="F.eks. Oslo" />
          <Input label="Influencerens land" value={filters.country} onChange={e => sf('country', e.target.value)} placeholder="F.eks. Norge" />
          <Input label="Følgernes hovedmarked (land)" value={filters.marketCountry} onChange={e => sf('marketCountry', e.target.value)} placeholder="F.eks. Norge" />
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-txt-muted">{filtered.length} influencere funnet</div>

      {/* Results grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-txt-muted">
          <div className="animate-spin w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full mr-3" />
          Laster influencere...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inf, i) => (
            <InfluencerCard key={inf.id} influencer={inf} delay={i * 0.06} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-txt-muted">
          <div className="mb-3"><Icons.Search /></div>
          <p className="text-base mb-1">Ingen influencere matcher filtrene dine</p>
          <p className="text-sm">Prøv å justere filtrene for bredere resultater</p>
        </div>
      )}
    </div>
  )
}
