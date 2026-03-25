// src/components/social/profile-card.tsx
'use client'

import Link from 'next/link'
import type { PublicProfile } from '@/types/social'

interface ProfileCardProps {
  profile: PublicProfile
  showContactButton?: boolean
  onContactAction?: () => void
  compact?: boolean
}

export function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  if (compact) {
    return (
      <Link href={`/profils/${profile.username}`} className="flex items-center gap-3 hover:opacity-80">
        <div className="h-9 w-9 rounded-full bg-muted flex-shrink-0 overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm font-medium">
              {(profile.displayName ?? profile.username).slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {profile.displayName ?? profile.username}
          </p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </Link>
    )
  }

  return (
    <div className="rounded-2xl border border-border p-5 space-y-4">
      {/* Avatar + nom */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-muted flex-shrink-0 overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg font-medium">
              {(profile.displayName ?? profile.username).slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{profile.displayName ?? profile.username}</p>
            {profile.verificationStatus !== 'none' && (
              <span className="text-xs bg-foreground/10 rounded-full px-1.5 py-0.5">✓</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
      )}

      {/* Infos visibles */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {profile.currentLevel > 0 && (
          <span>Niveau {profile.currentLevel}</span>
        )}
        {profile.country && (
          <span>{profile.city ? `${profile.city}, ` : ''}{profile.country}</span>
        )}
        {profile.pathName && (
          <span className="col-span-2">
            {profile.pathType ?? 'Voie'} : {profile.pathName}
          </span>
        )}
      </div>
    </div>
  )
}
