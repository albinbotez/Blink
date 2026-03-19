import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Avatar, Button } from './ui'
import { Icons } from './Icons'

export default function Navigation({ unreadCount = 0 }) {
  const { user, profile, userType, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navLinks = user ? (
    userType === 'business' ? [
      { path: '/', label: 'Hjem', icon: <Icons.Home /> },
      { path: '/discover', label: 'Oppdag', icon: <Icons.Search /> },
      { path: '/messages', label: 'Meldinger', icon: <Icons.Mail />, badge: unreadCount },
      { path: '/company-profile', label: 'Profil', icon: <Icons.Building /> },
    ] : [
      { path: '/', label: 'Hjem', icon: <Icons.Home /> },
      { path: '/dashboard', label: 'Dashboard', icon: <Icons.BarChart /> },
      { path: '/messages', label: 'Meldinger', icon: <Icons.Mail />, badge: unreadCount },
    ]
  ) : []

  const displayName = profile
    ? (userType === 'influencer' ? profile.name : profile.company_name) || 'Bruker'
    : 'Bruker'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center font-display font-extrabold text-lg text-white">
            C
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-txt-primary">
            Cre<span className="gradient-text">8</span>or
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium
                transition-all duration-200 no-underline
                ${isActive(link.path)
                  ? 'bg-accent-purple/10 text-accent-purple'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-white/[0.04]'
                }
              `}
            >
              {link.icon} {link.label}
              {link.badge > 0 && (
                <span className="absolute -top-0.5 right-1 w-[18px] h-[18px] rounded-full bg-accent-pink text-white text-[10px] font-bold flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                <Avatar name={displayName} size={32} src={profile?.avatar_url || profile?.logo_url} />
                <span className="text-sm font-medium text-txt-secondary">{displayName}</span>
              </div>
              <button onClick={handleSignOut}
                className="bg-transparent border-none text-txt-muted hover:text-txt-secondary cursor-pointer p-2 rounded-lg transition-colors">
                <Icons.Logout />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Logg inn</Button></Link>
              <Link to="/register"><Button size="sm">Kom i gang</Button></Link>
            </>
          )}

          {/* Mobile menu toggle */}
          {user && (
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden bg-transparent border-none text-txt-secondary cursor-pointer p-1">
              {mobileOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-white/[0.06] bg-bg-primary/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all
                ${isActive(link.path) ? 'bg-accent-purple/10 text-accent-purple' : 'text-txt-secondary'}
              `}
            >
              {link.icon} {link.label}
              {link.badge > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-accent-pink text-white text-[10px] font-bold flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
