// src/components/profile/avatar-picker.tsx
'use client'

import { useState } from 'react'
import { GALLERY_AVATARS, encodeGalleryAvatar, decodeGalleryAvatar } from '@/constants/avatars'
import { updateAvatarAction } from '@/lib/auth/actions'
import { useRouter } from 'next/navigation'

interface AvatarPickerProps {
  userId: string
  currentAvatarUrl?: string | null
}

export function AvatarPicker({ userId, currentAvatarUrl }: AvatarPickerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<number | null>(
    decodeGalleryAvatar(currentAvatarUrl)?.id ?? null
  )
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  const PALETTE_NAMES = ['or', 'violet', 'jade', 'rose', 'ardoise']
  const PALETTE_COLORS = [
    'hsl(38 60% 60%)',
    'hsl(265 60% 65%)',
    'hsl(162 55% 50%)',
    'hsl(338 60% 65%)',
    'hsl(218 55% 65%)',
  ]

  const filtered = activeFilter !== null
    ? GALLERY_AVATARS.filter(a => a.id >= activeFilter * 10 && a.id < (activeFilter + 1) * 10)
    : GALLERY_AVATARS

  async function handleSelect(id: number) {
    setSelected(id)
    setSaving(true)
    const result = await updateAvatarAction(userId, encodeGalleryAvatar(id))
    setSaving(false)
    if (result.success) {
      setIsOpen(false)
      router.refresh()
    }
  }

  const currentAvatar = selected !== null ? GALLERY_AVATARS[selected] : null

  return (
    <div className="space-y-3">
      <span className="label-field">Avatar</span>

      {/* Aperçu + bouton ouvrir */}
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-full flex-shrink-0 flex items-center justify-center select-none transition-all duration-200"
          style={{
            background: currentAvatar
              ? `linear-gradient(135deg, ${currentAvatar.bgFrom}, ${currentAvatar.bgTo})`
              : 'linear-gradient(135deg, hsl(248 28% 14%), hsl(248 24% 10%))',
            border: currentAvatar
              ? `1px solid ${currentAvatar.borderColor}`
              : '1px solid hsl(248 16% 22%)',
            color: currentAvatar?.textColor ?? 'hsl(248 10% 55%)',
            fontSize: '1.75rem',
            lineHeight: 1,
          }}
        >
          {currentAvatar?.symbol ?? '◯'}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-ghost text-sm px-4 py-2"
        >
          Changer d'avatar
        </button>
      </div>

      {/* Modal galerie */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'hsl(246 32% 4% / 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            className="card-elevated w-full max-w-md animate-scale-in overflow-hidden"
            style={{ maxHeight: '85dvh' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid hsl(248 20% 14%)' }}
            >
              <div>
                <h3 className="font-serif text-lg font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
                  Choisis ton avatar
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 50%)' }}>
                  {GALLERY_AVATARS.length} avatars disponibles
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-lg transition-colors hover:bg-surface-elevated"
                style={{ color: 'hsl(248 10% 50%)' }}
              >
                ×
              </button>
            </div>

            {/* Filtres palette */}
            <div className="flex gap-2 px-5 py-3" style={{ borderBottom: '1px solid hsl(248 20% 12%)' }}>
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${activeFilter === null ? 'badge-gold' : 'badge-muted'}`}
              >
                Tous
              </button>
              {PALETTE_NAMES.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === i ? null : i)}
                  className="text-xs px-3 py-1 rounded-full transition-all badge-muted"
                  style={{
                    ...(activeFilter === i && {
                      background: `${PALETTE_COLORS[i]}18`,
                      color: PALETTE_COLORS[i],
                      border: `1px solid ${PALETTE_COLORS[i]}30`,
                    }),
                  }}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Grille */}
            <div
              className="grid grid-cols-5 gap-2.5 p-5 overflow-y-auto"
              style={{ maxHeight: '55dvh' }}
            >
              {filtered.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelect(avatar.id)}
                  disabled={saving}
                  className="aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-150 hover:scale-105 active:scale-95 relative"
                  style={{
                    background: `linear-gradient(135deg, ${avatar.bgFrom}, ${avatar.bgTo})`,
                    border: selected === avatar.id
                      ? `2px solid ${avatar.textColor}`
                      : `1px solid ${avatar.borderColor}`,
                    color: avatar.textColor,
                    boxShadow: selected === avatar.id
                      ? `0 0 0 3px ${avatar.textColor}20`
                      : 'none',
                  }}
                >
                  <span style={{ lineHeight: 1 }}>{avatar.symbol}</span>
                  {selected === avatar.id && (
                    <span
                      className="absolute bottom-1 right-1 text-[8px] leading-none"
                      style={{ color: avatar.textColor }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            {saving && (
              <div
                className="px-5 py-3 text-center text-xs"
                style={{
                  borderTop: '1px solid hsl(248 20% 12%)',
                  color: 'hsl(248 10% 50%)',
                }}
              >
                Sauvegarde…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
