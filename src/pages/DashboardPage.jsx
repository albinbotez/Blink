import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Avatar, Badge, Button, Input, Textarea, StatCard, Spinner } from '../components/ui'
import { Icons } from '../components/Icons'
import { formatFollowers } from '../lib/utils'

export default function DashboardPage() {
  const { user, profile, userType, updateProfile, uploadAvatar, loading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-32 text-txt-muted">
        <Spinner /> <span className="ml-3">Laster dashboard...</span>
      </div>
    )
  }

  const startEditing = () => {
    setForm({
      name: profile.name || '',
      bio: profile.bio || '',
      instagram_username: profile.instagram_username || '',
      followers: profile.followers?.toString() || '',
      engagement_rate: profile.engagement_rate?.toString() || '',
      age: profile.age?.toString() || '',
      city: profile.city || '',
      country: profile.country || '',
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
        followers: parseInt(form.followers) || profile.followers,
        engagement_rate: parseFloat(form.engagement_rate) || profile.engagement_rate,
        age: parseInt(form.age) || profile.age,
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
      try {
        await uploadAvatar(file)
      } catch (err) {
        console.error('Upload error:', err)
      }
    }
  }

  const u = (key, val) => setForm(p => ({ ...p, [key]: val }))

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
        <StatCard icon={<Icons.Users />} label="Følgere" value={formatFollowers(profile.followers)} />
        <StatCard icon={<Icons.Heart />} label="Engasjement" value={`${profile.engagement_rate}%`} color="#10b981" />
        <StatCard icon={<Icons.Mail />} label="Meldinger" value="–" color="#ec4899" />
        <StatCard icon={<Icons.Eye />} label="Profil-visninger" value="–" color="#3b82f6" />
      </div>

      {/* Profile card */}
      <div className="animate-fade-in bg-bg-card border border-white/[0.06] rounded-[18px] p-8">
        <div className="flex items-center gap-5 mb-7">
          <div className="relative group">
            <Avatar name={profile.name} size={72} src={profile.avatar_url} />
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Icons.Camera />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{profile.name}</h2>
            <p className="text-txt-muted text-sm">
              {profile.instagram_username} · {profile.city}, {profile.country}
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
              {profile.bio || 'Ingen bio lagt til ennå. Klikk "Rediger profil" for å legge til.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>{profile.niche || 'Ingen kategori'}</Badge>
              <Badge variant="green">{profile.engagement_rate}% engasjement</Badge>
              <Badge variant="blue">{formatFollowers(profile.followers)} følgere</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
