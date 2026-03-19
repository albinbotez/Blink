import { useAuth } from '../hooks/useAuth'
import { Avatar, Badge, Button, Spinner } from '../components/ui'
import { Icons } from '../components/Icons'

export default function CompanyProfilePage() {
  const { profile, loading, uploadAvatar } = useAuth()

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-32 text-txt-muted">
        <Spinner /> <span className="ml-3">Laster profil...</span>
      </div>
    )
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await uploadAvatar(file)
      } catch (err) {
        console.error('Upload error:', err)
      }
    }
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 py-8">
      <div className="animate-fade-in bg-bg-card border border-white/[0.06] rounded-[20px] overflow-hidden">
        <div className="h-[100px] bg-gradient-to-r from-accent-blue to-accent-purple" />
        <div className="p-8 text-center -mt-10">
          <div className="relative group inline-block">
            <Avatar name={profile.company_name} size={80} src={profile.logo_url} />
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Icons.Camera />
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
          <h1 className="text-[28px] font-display font-bold mt-4 tracking-tight">{profile.company_name}</h1>
          <div className="mt-2">
            <Badge variant="blue">{profile.industry || 'Bedrift'}</Badge>
          </div>
          <p className="text-txt-secondary mt-4 leading-relaxed max-w-[500px] mx-auto">
            {profile.description || 'Ingen beskrivelse lagt til ennå.'}
          </p>
        </div>
      </div>
    </div>
  )
}
