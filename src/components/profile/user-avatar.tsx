// src/components/profile/user-avatar.tsx
// Composant universel d'affichage d'avatar — galerie, URL ou initiale

import { decodeGalleryAvatar } from '@/constants/avatars'

interface UserAvatarProps {
  avatarUrl?: string | null
  displayName?: string | null
  username?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showRing?: boolean
}

const SIZE_MAP = {
  xs: { container: 'h-7 w-7',  text: 'text-xs',  symbol: 'text-sm' },
  sm: { container: 'h-9 w-9',  text: 'text-sm',  symbol: 'text-base' },
  md: { container: 'h-11 w-11', text: 'text-base', symbol: 'text-lg' },
  lg: { container: 'h-14 w-14', text: 'text-lg',  symbol: 'text-2xl' },
  xl: { container: 'h-20 w-20', text: 'text-2xl', symbol: 'text-3xl' },
}

export function UserAvatar({
  avatarUrl,
  displayName,
  username,
  size = 'md',
  className = '',
  showRing = false,
}: UserAvatarProps) {
  const { container, text, symbol } = SIZE_MAP[size]
  const initial = (displayName || username || 'A').slice(0, 1).toUpperCase()
  const ringClass = showRing
    ? 'ring-2 ring-offset-2 ring-offset-background'
    : ''

  // 1. Avatar galerie
  const galleryAvatar = decodeGalleryAvatar(avatarUrl)
  if (galleryAvatar) {
    return (
      <div
        className={`${container} rounded-full flex-shrink-0 flex items-center justify-center select-none ${ringClass} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${galleryAvatar.bgFrom}, ${galleryAvatar.bgTo})`,
          border: `1px solid ${galleryAvatar.borderColor}`,
          color: galleryAvatar.textColor,
        }}
      >
        <span className={symbol} style={{ lineHeight: 1 }}>
          {galleryAvatar.symbol}
        </span>
      </div>
    )
  }

  // 2. URL externe (photo uploadée)
  if (avatarUrl && avatarUrl.startsWith('http')) {
    return (
      <div
        className={`${container} rounded-full flex-shrink-0 overflow-hidden ${ringClass} ${className}`}
        style={{ border: '1px solid hsl(248 16% 22%)' }}
      >
        <img
          src={avatarUrl}
          alt={displayName ?? username ?? ''}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  // 3. Initiale par défaut
  return (
    <div
      className={`${container} rounded-full flex-shrink-0 flex items-center justify-center select-none ${text} font-medium ${ringClass} ${className}`}
      style={{
        background: 'linear-gradient(135deg, hsl(248 28% 14%), hsl(248 24% 10%))',
        border: '1px solid hsl(248 16% 22%)',
        color: 'hsl(248 10% 60%)',
      }}
    >
      {initial}
    </div>
  )
}
