import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'
import { Icons } from '../components/Icons'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      if (!email || !password) throw new Error('Fyll inn e-post og passord')
      await signIn(email, password)
      // Auth state change will trigger profile load, then redirect
      // We wait briefly for the profile to load
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      setError(err.message || 'Feil e-post eller passord')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-[420px] w-full bg-bg-card border border-white/[0.06] rounded-[20px] p-10 animate-fade-in">
        <h1 className="text-[28px] font-display font-bold mb-2 text-center tracking-tight">Velkommen tilbake</h1>
        <p className="text-txt-secondary mb-8 text-center text-[15px]">Logg inn på din konto</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="E-post" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="din@epost.no"
            icon={<Icons.Mail />}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <Input
            label="Passord" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Ditt passord"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <Button fullWidth size="lg" onClick={handleLogin} disabled={loading} className="mt-2">
            {loading ? 'Logger inn...' : 'Logg inn'}
          </Button>
        </div>

        <p className="mt-6 text-sm text-txt-muted text-center">
          Ingen konto?{' '}
          <Link to="/register" className="text-accent-purple font-medium hover:underline no-underline">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  )
}
