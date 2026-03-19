import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Badge } from './ui'
import { Icons } from './Icons'
import { formatFollowers } from '../lib/utils'

export default function InfluencerCard({ influencer, delay = 0 }) {
  const [hovered, setHovered] = useState(false)

  // Support both DB column names and display names
  const name = influencer.name || ''
  const username = influencer.instagram_username || influencer.username || ''
  const niche = influencer.niche || ''
  const bio = influencer.bio || ''
  const city = influencer.city || ''
  const country = influencer.country || ''
  const followers = influencer.followers || 0
  const engagement = influencer.engagement_rate || 0
  const femalePercent = influencer.audience_female ?? influencer.gender_distribution?.female ?? 0
  const verified = influencer.is_verified || influencer.verified || false
  const avatar = influencer.avatar_url || influencer.avatar || null

  return (
    <Link
      to={`/profile/${influencer.id}`}
      className="no-underline text-inherit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="animate-slide-up gradient-border overflow-hidden rounded-[18px] cursor-pointer transition-all duration-300"
        style={{
          background: hovered ? '#1c1c28' : '#16161f',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 12px 40px rgba(139,92,246,0.12)' : '0 4px 24px rgba(0,0,0,0.3)',
          animationDelay: `${delay}s`,
        }}
      >
        <div className="p-6 pb-5">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <Avatar name={name} size={52} src={avatar} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-semibold text-base truncate">{name}</span>
                {verified && <span className="text-accent-purple"><Icons.Check /></span>}
              </div>
              <div className="text-[13px] text-txt-muted flex items-center gap-1">
                <Icons.Instagram /> {username}
              </div>
            </div>
            <Badge>{niche}</Badge>
          </div>

          {/* Bio */}
          <p className="text-[13px] text-txt-secondary leading-relaxed mb-4 line-clamp-2">
            {bio}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center py-2.5 bg-bg-secondary rounded-[10px]">
              <div className="text-base font-bold font-display">{formatFollowers(followers)}</div>
              <div className="text-[11px] text-txt-muted mt-0.5">Følgere</div>
            </div>
            <div className="text-center py-2.5 bg-bg-secondary rounded-[10px]">
              <div className="text-base font-bold font-display text-accent-green">{engagement}%</div>
              <div className="text-[11px] text-txt-muted mt-0.5">Engasjement</div>
            </div>
            <div className="text-center py-2.5 bg-bg-secondary rounded-[10px]">
              <div className="text-base font-bold font-display">{femalePercent}%</div>
              <div className="text-[11px] text-txt-muted mt-0.5">Kvinner</div>
            </div>
          </div>

          {/* Location */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-txt-muted">
            <Icons.MapPin /> {city}{city && country ? ', ' : ''}{country}
          </div>
        </div>
      </div>
    </Link>
  )
}
