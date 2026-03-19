// ============================================================
// CONSTANTS
// ============================================================
export const NICHES = [
  'Lifestyle', 'Mote', 'Mat', 'Trening', 'Gaming',
  'Tech', 'Reise', 'Skjønnhet', 'Annet'
]

export const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45+']

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Format follower count: 124000 → "124K" */
export function formatFollowers(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

/** Get initials from a name: "Sara Nordvik" → "SN" */
export function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/** Deterministic color from a string (for avatars) */
export function getAvatarColor(name) {
  const colors = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/** Calculate engagement rate from likes, comments, followers */
export function calcEngagementRate(avgLikes, avgComments, followers) {
  if (!followers || followers === 0) return 0
  return (((avgLikes || 0) + (avgComments || 0)) / followers * 100).toFixed(2)
}

/** Format a timestamp to readable time */
export function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Nå'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}t`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

/** Format time as HH:MM */
export function formatTimeShort(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
}
