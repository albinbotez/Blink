import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Avatar, Badge, Button, Input, Textarea, StatCard } from '../components/ui'
import { Icons } from '../components/Icons'
import { formatFollowers } from '../lib/utils'

export default function DashboardPage() {
  const { user, profile, userType, updateProfile, uploadAvatar, loading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  // Don't block on loading forever — show dashboard even with empty profile
  const p = profile || {}

  const startEditing = () => {
    setForm({
      name: p.name || '',
      bio: p.bio || '',
      instagram_username: p.instagram_username || '',
      followers: p.followers?.toString() || '0',
      engagement_rate: p.engagement_rate?.toString() || '0',
      age: p.age?.toString() || '',
      city: p.city || '',
      country: p.country || '',
    })
    setEditing(true)
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      await updateProfile({
        name: form.name,
        bio: form.bio,
        instagram_username: form.instagram_username,
        followers: parseInt(form.followers) || 0,
        engagement_rate: parseFloat(form.engagement_rate) || 0,
        age: parseInt(form.age) || null,
        city: form.city,
        country: form.country,
      })
      setEditing(false)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try { await uploadAvatar(file) } catch (err) { console.error('Upload error:', err) }
    }
  }

  const u = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="animate-fade-in flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-txt-secondary text-[15px]">Administrer profilen din</p>
        </div>
        <Button variant={editing ? 'primary' : 'secondary'}
          onClick={editing ? saveChanges : startEditing}
          disabled={saving}>
          {saving ? 'Lagrer...' : editing ? 'Lagre endringer' : 'Rediger profil'}
        </Button>
      </div>

      {/* Stats overview */}
      <div className="animate-fade-in grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Icons.Users />} label="Følgere" value={formatFollowers(p.followers || 0)} />
        <StatCard icon={<Icons.Heart />} label="Engasjement" value={`${p.engagement_rate || 0}%`} color="#10b981" />
        <StatCard icon={<Icons.Mail />} label="Meldinger" value="0" color="#ec4899" />
        <StatCard icon={<Icons.Eye />} label="Profil-visninger" value="–" color="#3b82f6" />
      </div>

      {/* Profile card */}
      <div className="animate-fade-in bg-bg-card border border-white/[0.06] rounded-[18px] p-8">
        <div className="flex items-center gap-5 mb-7">
          <div className="relative group">
            <Avatar name={p.name || user?.email || 'Bruker'} size={72} src={p.avatar_url} />
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Icons.Camera />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{p.name || 'Ny bruker'}</h2>
            <p className="text-txt-muted text-sm">
              {p.instagram_username || '@brukernavn'} · {p.city || 'By'}, {p.country || 'Land'}
            </p>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Navn" value={form.name} onChange={e => u('name', e.target.value)} />
              <Input label="Instagram" value={form.instagram_username} onChange={e => u('instagram_username', e.target.value)} />
            </div>
            <Textarea label="Bio" value={form.bio} onChange={e => u('bio', e.target.value)} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Følgere" type="number" value={form.followers} onChange={e => u('followers', e.target.value)} />
              <Input label="Engasjementsrate (%)" type="number" value={form.engagement_rate} onChange={e => u('engagement_rate', e.target.value)} />
              <Input label="Alder" type="number" value={form.age} onChange={e => u('age', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="By" value={form.city} onChange={e => u('city', e.target.value)} />
              <Input label="Land" value={form.country} onChange={e => u('country', e.target.value)} />
            </div>
            <Button variant="ghost" onClick={() => setEditing(false)} className="self-start mt-2">
              Avbryt
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-txt-secondary leading-relaxed mb-5">
              {p.bio || 'Ingen bio lagt til ennå. Klikk "Rediger profil" for å legge til.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>{p.niche || 'Ingen kategori'}</Badge>
              <Badge variant="green">{p.engagement_rate || 0}% engasjement</Badge>
              <Badge variant="blue">{formatFollowers(p.followers || 0)} følgere</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
