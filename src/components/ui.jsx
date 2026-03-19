import { getInitials, getAvatarColor } from '../lib/utils'

// ============================================================
// AVATAR
// ============================================================
export function Avatar({ name, size = 48, src, className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-display font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: getAvatarColor(name || 'U'),
        fontSize: size * 0.38,
      }}
    >
      {getInitials(name || 'User')}
    </div>
  )
}

// ============================================================
// BADGE
// ============================================================
const badgeVariants = {
  default: 'bg-accent-purple/15 text-purple-400 border-accent-purple/20',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export function Badge({ children, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${badgeVariants[variant]}`}>
      {children}
    </span>
  )
}

// ============================================================
// BUTTON
// ============================================================
const btnVariants = {
  primary: 'bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg shadow-accent-purple/30 hover:shadow-accent-purple/40',
  secondary: 'bg-bg-elevated text-txt-primary border border-white/[0.06] hover:border-white/[0.12]',
  ghost: 'bg-transparent text-txt-secondary hover:text-txt-primary hover:bg-white/[0.04]',
  outline: 'bg-transparent text-accent-purple border border-accent-purple hover:bg-accent-purple/10',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
}
const btnSizes = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function Button({ children, onClick, variant = 'primary', size = 'md', fullWidth, disabled, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-display font-semibold rounded-xl cursor-pointer inline-flex items-center justify-center gap-2
        transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================
// INPUT
// ============================================================
export function Input({ label, icon, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] font-medium text-txt-secondary font-display">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted">{icon}</span>}
        <input
          {...props}
          className={`
            w-full py-3 bg-bg-secondary border rounded-[10px] text-txt-primary text-sm font-body
            outline-none transition-colors duration-200
            focus:border-accent-purple
            placeholder:text-txt-muted
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            ${error ? 'border-red-500' : 'border-white/[0.06]'}
            ${className}
          `}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ============================================================
// SELECT
// ============================================================
export function Select({ label, options, placeholder, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] font-medium text-txt-secondary font-display">{label}</label>}
      <select
        {...props}
        className={`
          w-full py-3 px-4 bg-bg-secondary border border-white/[0.06] rounded-[10px]
          text-txt-primary text-sm font-body outline-none cursor-pointer appearance-none
          transition-colors focus:border-accent-purple
          bg-no-repeat bg-[right_14px_center]
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238888a0' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ============================================================
// TEXTAREA
// ============================================================
export function Textarea({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] font-medium text-txt-secondary font-display">{label}</label>}
      <textarea
        {...props}
        className={`
          w-full py-3 px-4 bg-bg-secondary border border-white/[0.06] rounded-[10px]
          text-txt-primary text-sm font-body outline-none resize-y min-h-[100px]
          transition-colors focus:border-accent-purple
          placeholder:text-txt-muted
          ${className}
        `}
      />
    </div>
  )
}

// ============================================================
// RANGE SLIDER
// ============================================================
export function RangeSlider({ label, min = 0, max = 100, value, onChange, suffix = '', step = 1 }) {
  const isRange = Array.isArray(value)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[13px] font-medium text-txt-secondary font-display">{label}</label>
        <span className="text-[13px] font-semibold text-accent-purple">
          {isRange ? `${value[0]}${suffix} – ${value[1]}${suffix}` : `${value}${suffix}`}
        </span>
      </div>
      {isRange ? (
        <div className="flex gap-2 items-center">
          <input type="range" min={min} max={max} step={step} value={value[0]}
            onChange={e => onChange([parseInt(e.target.value), value[1]])} className="flex-1" />
          <input type="range" min={min} max={max} step={step} value={value[1]}
            onChange={e => onChange([value[0], parseInt(e.target.value)])} className="flex-1" />
        </div>
      ) : (
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseInt(e.target.value))} className="w-full" />
      )}
    </div>
  )
}

// ============================================================
// MULTI SELECT (Tag-style)
// ============================================================
export function MultiSelect({ label, options, selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt))
    else onChange([...selected, opt])
  }
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-[13px] font-medium text-txt-secondary font-display">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)}
            className={`
              px-3.5 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200
              ${selected.includes(opt)
                ? 'border-accent-purple bg-accent-purple/15 text-purple-400'
                : 'border-white/[0.06] bg-bg-secondary text-txt-secondary hover:border-white/[0.12]'
              }
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// STAT CARD
// ============================================================
export function StatCard({ icon, label, value, color = '#8b5cf6' }) {
  return (
    <div className="bg-bg-card border border-white/[0.06] rounded-[14px] px-5 py-4 flex items-center gap-3.5">
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-txt-muted">{label}</div>
        <div className="text-lg font-bold font-display">{value}</div>
      </div>
    </div>
  )
}

// ============================================================
// LOADING SPINNER
// ============================================================
export function Spinner({ size = 24 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
