import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { Avatar, Badge, Button, StatCard, Textarea, Spinner } from '../components/ui'
import { Icons } from '../components/Icons'
import { formatFollowers } from '../lib/utils'

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userType } = useAuth()
  const { getOrCreateConversation, sendMessage: sendMsg } = useMessages(user?.id)

  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [id])

  async function loadProfile() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) console.error(error)
    setInfluencer(data)
    setLoading(false)
  }

  async function handleSendMessage() {
    if (!message.trim() || !user) return
    setSending(true)
    try {
      const convId = await getOrCreateConversation(id)
      if (convId) {
        await sendMsg(convId, message)
        setMessageSent(true)
        setTimeout(() => {
          setShowMessageModal(false)
          setMessageSent(false)
          setMessage('')
        }, 2000)
      }
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-txt-muted">
        <Spinner /> <span className="ml-3">Laster profil...</span>
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="text-center py-32 text-txt-muted">
        <p className="text-lg mb-4">Profilen ble ikke funnet</p>
        <Button variant="secondary" onClick={() => navigate('/discover')}>Tilbake til søk</Button>
      </div>
    )
  }

  const markets = (() => {
    try {
      const m = typeof influencer.top_markets === 'string' ? JSON.parse(influencer.top_markets) : influencer.top_markets
      return (m || []).filter(x => x.city)
    } catch { return [] }
  })()

  const ageDistribution = {
    '13–17': influencer.audience_age_13_17 || 0,
    '18–24': influencer.audience_age_18_24 || 0,
    '25–34': influencer.audience_age_25_34 || 0,
    '35–44': influencer.audience_age_35_44 || 0,
    '45+': influencer.audience_age_45_plus || 0,
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <button onClick={() => navigate(-1)}
        className="bg-transparent border-none text-txt-muted cursor-pointer text-sm mb-6 flex items-center gap-1 hover:text-txt-secondary transition-colors">
        <Icons.ChevronLeft /> Tilbake
      </button>

      <div className="animate-fade-in bg-bg-card border border-white/[0.06] rounded-[22px] overflow-hidden">
        {/* Gradient header */}
        <div className="h-[120px] bg-gradient-to-r from-accent-purple to-accent-pink relative">
          <div className="absolute -bottom-10 left-8">
            <Avatar name={influencer.name} size={80} src={influencer.avatar_url}
              className="border-4 border-bg-card" />
          </div>
        </div>

        <div className="pt-14 px-8 pb-8">
          {/* Name + actions */}
          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] font-display font-bold tracking-tight">{influencer.name}</h1>
                {influencer.is_verified && <span className="text-accent-purple"><Icons.Check /></span>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-txt-secondary flex-wrap">
                <span className="flex items-center gap-1"><Icons.Instagram /> {influencer.instagram_username}</span>
                <span className="flex items-center gap-1"><Icons.MapPin /> {influencer.city}, {influencer.country}</span>
                <Badge>{influencer.niche}</Badge>
              </div>
            </div>
            {user && userType === 'business' && (
              <Button onClick={() => setShowMessageModal(true)}>
                <Icons.Mail /> Send melding
              </Button>
            )}
          </div>

          <p className="text-txt-secondary leading-relaxed mb-7 text-[15px]">{influencer.bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<Icons.Users />} label="Følgere" value={formatFollowers(influencer.followers)} />
            <StatCard icon={<Icons.Heart />} label="Engasjement" value={`${influencer.engagement_rate}%`} color="#10b981" />
            <StatCard icon={<Icons.User />} label="Alder" value={`${influencer.age || '–'} år`} color="#3b82f6" />
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age distribution */}
            <div className="bg-bg-secondary rounded-[14px] p-6">
              <h3 className="text-base font-display font-semibold mb-5">Aldersfordeling</h3>
              {Object.entries(ageDistribution).map(([age, pct]) => (
                <div key={age} className="mb-3">
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-txt-secondary">{age}</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-purple to-accent-pink rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Gender + Markets */}
            <div className="bg-bg-secondary rounded-[14px] p-6">
              <h3 className="text-base font-display font-semibold mb-5">Kjønnsfordeling</h3>
              <div className="mb-5">
                <div className="h-3 rounded-md overflow-hidden flex mb-3">
                  <div className="bg-accent-pink transition-all duration-700"
                    style={{ width: `${influencer.audience_female || 50}%` }} />
                  <div className="bg-accent-blue transition-all duration-700"
                    style={{ width: `${influencer.audience_male || 50}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-accent-pink" />
                    Kvinner: <strong>{influencer.audience_female || 50}%</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-accent-blue" />
                    Menn: <strong>{influencer.audience_male || 50}%</strong>
                  </div>
                </div>
              </div>

              {markets.length > 0 && (
                <>
                  <h3 className="text-base font-display font-semibold mt-7 mb-4">Topp markeder</h3>
                  {markets.map((m, i) => (
                    <div key={i} className="flex items-center gap-2.5 mb-2.5 px-3 py-2 bg-bg-card rounded-lg">
                      <span className="font-bold text-accent-purple font-display">{i + 1}</span>
                      <Icons.Globe />
                      <span className="text-sm">{m.city}, {m.country}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-6"
          onClick={() => setShowMessageModal(false)}>
          <div className="animate-fade-in bg-bg-card border border-white/[0.06] rounded-[20px] p-8 max-w-[480px] w-full"
            onClick={e => e.stopPropagation()}>
            {messageSent ? (
              <div className="text-center py-5">
                <div className="text-5xl mb-3">✓</div>
                <h3 className="text-xl font-display font-semibold mb-2">Melding sendt!</h3>
                <p className="text-txt-secondary">Din melding til {influencer.name} er sendt</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-display font-semibold">Send melding til {influencer.name}</h3>
                  <button onClick={() => setShowMessageModal(false)}
                    className="bg-transparent border-none text-txt-muted cursor-pointer hover:text-txt-secondary">
                    <Icons.X />
                  </button>
                </div>
                <Textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Skriv din melding her..." className="min-h-[140px]" />
                <Button fullWidth size="lg" onClick={handleSendMessage} disabled={!message.trim() || sending}
                  className="mt-4">
                  {sending ? 'Sender...' : <><Icons.Send /> Send melding</>}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
