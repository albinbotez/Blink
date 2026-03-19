import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Select, Textarea } from '../components/ui'
import { Icons } from '../components/Icons'
import { NICHES, calcEngagementRate } from '../lib/utils'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUpInfluencer, signUpBusiness } = useAuth()

  const preselected = searchParams.get('type')
  const [step, setStep] = useState(preselected ? 1 : 0)
  const [userType, setUserType] = useState(preselected || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [engagementRate, setEngagementRate] = useState(null)

  const [form, setForm] = useState({
    email: '', password: '', name: '', bio: '', instagram: '',
    age: '', city: '', country: '', niche: '',
    followers: '', avg_likes: '', avg_comments: '',
    age_13_17: '', age_18_24: '', age_25_34: '', age_35_44: '', age_45: '',
    gender_female: '', gender_male: '',
    market1_city: '', market1_country: '',
    market2_city: '', market2_country: '',
    market3_city: '', market3_country: '',
    company_name: '', industry: '', description: '',
  })

  const u = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const calcEngagement = () => {
    const rate = calcEngagementRate(
      parseInt(form.avg_likes) || 0,
      parseInt(form.avg_comments) || 0,
      parseInt(form.followers) || 1
    )
    setEngagementRate(rate)
  }

  const handleRegister = async () => {
    setError('')
    setLoading(true)
    try {
      if (!form.email || !form.password) throw new Error('E-post og passord er påkrevd')
      if (form.password.length < 6) throw new Error('Passord må være minst 6 tegn')

      if (userType === 'influencer') {
        await signUpInfluencer(form.email, form.password, {
          ...form,
          engagement_rate: engagementRate || 0,
        })
        navigate('/dashboard')
      } else {
        await signUpBusiness(form.email, form.password, form)
        navigate('/discover')
      }
    } catch (err) {
      setError(err.message || 'Noe gikk galt ved registrering')
    } finally {
      setLoading(false)
    }
  }

  // Step 0: Choose type
  if (step === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-[600px] w-full text-center animate-fade-in">
          <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Velkommen til Cre8or</h1>
          <p className="text-txt-secondary mb-12 text-base">Hva beskriver deg best?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { type: 'influencer', icon: <Icons.User />, title: 'Influencer', desc: 'Jeg skaper innhold og vil vise profilen min til bedrifter', color: '#ec4899' },
              { type: 'business', icon: <Icons.Building />, title: 'Bedrift', desc: 'Jeg leter etter influencere å samarbeide med', color: '#3b82f6' },
            ].map(opt => (
              <button key={opt.type}
                onClick={() => { setUserType(opt.type); setStep(1) }}
                className="bg-bg-card border border-white/[0.06] rounded-[18px] p-8 cursor-pointer transition-all duration-300 text-center hover:-translate-y-1 group"
                style={{ '--hc': opt.color }}
                onMouseEnter={e => e.currentTarget.style.borderColor = opt.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                  style={{ background: `${opt.color}15`, color: opt.color }}>
                  {opt.icon}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-txt-primary">{opt.title}</h3>
                <p className="text-sm text-txt-secondary leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <p className="mt-8 text-sm text-txt-muted">
            Har allerede en konto?{' '}
            <span onClick={() => navigate('/login')} className="text-accent-purple cursor-pointer font-medium hover:underline">
              Logg inn
            </span>
          </p>
        </div>
      </div>
    )
  }

  // Step 1: Registration form
  return (
    <div className="min-h-[80vh] flex items-start justify-center px-6 py-12">
      <div className="max-w-[640px] w-full animate-fade-in">
        <button onClick={() => setStep(0)}
          className="bg-transparent border-none text-txt-muted cursor-pointer text-sm mb-6 flex items-center gap-1 hover:text-txt-secondary transition-colors">
          <Icons.ChevronLeft /> Tilbake
        </button>

        <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">
          {userType === 'influencer' ? 'Opprett influencer-profil' : 'Registrer bedrift'}
        </h1>
        <p className="text-txt-secondary mb-9 text-[15px]">
          {userType === 'influencer'
            ? 'Fyll ut profilen din slik at bedrifter kan finne deg'
            : 'Opprett din bedriftskonto for å finne influencere'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Common: email + password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="E-post" type="email" value={form.email} onChange={e => u('email', e.target.value)} placeholder="din@epost.no" />
            <Input label="Passord" type="password" value={form.password} onChange={e => u('password', e.target.value)} placeholder="Minst 6 tegn" />
          </div>

          {userType === 'influencer' ? (
            <>
              {/* Personal info */}
              <div className="border-t border-white/[0.06] pt-5">
                <h3 className="text-lg font-display font-semibold mb-4">Personlig info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Input label="Fullt navn" value={form.name} onChange={e => u('name', e.target.value)} placeholder="Ditt navn" />
                  <Input label="Instagram-brukernavn" value={form.instagram} onChange={e => u('instagram', e.target.value)} placeholder="@brukernavn" />
                </div>
                <Textarea label="Bio" value={form.bio} onChange={e => u('bio', e.target.value)} placeholder="Kort om deg selv..." />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Input label="Alder" type="number" value={form.age} onChange={e => u('age', e.target.value)} placeholder="25" />
                  <Input label="By" value={form.city} onChange={e => u('city', e.target.value)} placeholder="Oslo" />
                  <Input label="Land" value={form.country} onChange={e => u('country', e.target.value)} placeholder="Norge" />
                </div>
                <div className="mt-4">
                  <Select label="Nisje/kategori" options={NICHES} value={form.niche} onChange={e => u('niche', e.target.value)} placeholder="Velg kategori" />
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t border-white/[0.06] pt-5">
                <h3 className="text-lg font-display font-semibold mb-4">Statistikk</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Input label="Følgerantall" type="number" value={form.followers} onChange={e => u('followers', e.target.value)} placeholder="124000" />
                  <Input label="Snitt likes" type="number" value={form.avg_likes} onChange={e => u('avg_likes', e.target.value)} placeholder="5200" />
                  <Input label="Snitt kommentarer" type="number" value={form.avg_comments} onChange={e => u('avg_comments', e.target.value)} placeholder="340" />
                </div>

                {/* Engagement calculator */}
                <div className="bg-bg-card border border-white/[0.06] rounded-[14px] p-5 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-display font-semibold">Engasjementsrate-kalkulator</span>
                    <Button size="sm" variant="outline" onClick={calcEngagement}>Beregn</Button>
                  </div>
                  <p className="text-xs text-txt-muted mb-2">Formel: (snitt likes + snitt kommentarer) / følgere × 100</p>
                  {engagementRate && (
                    <div className="text-3xl font-bold font-display text-accent-green">{engagementRate}%</div>
                  )}
                </div>

                {/* Age distribution */}
                <h4 className="text-sm font-semibold mb-3">Aldersfordeling på følgere (%)</h4>
                <div className="grid grid-cols-5 gap-2.5 mb-4">
                  {[['13-17','age_13_17'],['18-24','age_18_24'],['25-34','age_25_34'],['35-44','age_35_44'],['45+','age_45']].map(([label, key]) => (
                    <Input key={key} label={label} type="number" value={form[key]} onChange={e => u(key, e.target.value)} placeholder="%" className="text-center" />
                  ))}
                </div>

                {/* Gender distribution */}
                <h4 className="text-sm font-semibold mb-3">Kjønnsfordeling (%)</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input label="Kvinner" type="number" value={form.gender_female} onChange={e => u('gender_female', e.target.value)} placeholder="60" />
                  <Input label="Menn" type="number" value={form.gender_male} onChange={e => u('gender_male', e.target.value)} placeholder="40" />
                </div>

                {/* Top markets */}
                <h4 className="text-sm font-semibold mb-3">Topp 3 geografiske markeder</h4>
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-2 gap-3 mb-2.5">
                    <Input label={`Marked ${i} – by`} value={form[`market${i}_city`]} onChange={e => u(`market${i}_city`, e.target.value)} placeholder="By" />
                    <Input label={`Marked ${i} – land`} value={form[`market${i}_country`]} onChange={e => u(`market${i}_country`, e.target.value)} placeholder="Land" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <Input label="Firmanavn" value={form.company_name} onChange={e => u('company_name', e.target.value)} placeholder="Bedriftens navn" />
              <Input label="Bransje" value={form.industry} onChange={e => u('industry', e.target.value)} placeholder="F.eks. Mote, Teknologi, Mat..." />
              <Textarea label="Beskrivelse" value={form.description} onChange={e => u('description', e.target.value)} placeholder="Beskriv bedriften din..." />
            </>
          )}

          <Button fullWidth size="lg" onClick={handleRegister} disabled={loading} className="mt-4">
            {loading ? 'Oppretter konto...' : 'Opprett konto'}
          </Button>
        </div>
      </div>
    </div>
  )
}
