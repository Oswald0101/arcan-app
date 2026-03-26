// src/components/profile/avatar-picker.tsx
// Refonte : Sélecteur d'avatar plein écran, mobile-first, prévention des écrans noirs

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
    try {
      const result = await updateAvatarAction(userId, encodeGalleryAvatar(id))
      if (result.success) {
        setIsOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error)
    } finally {
      setSaving(false)
    }
  }

  const currentAvatar = selected !== null ? GALLERY_AVATARS[selected] : null

  return (
    <div className="space-y-4">
      <span className="label-field">Avatar</span>

      {/* Aperçu + bouton ouvrir */}
      <div className="flex items-center gap-4">
        <div
          className="h-20 w-20 rounded-full flex-shrink-0 flex items-center justify-center select-none transition-all duration-200"
          style={{
            background: currentAvatar
              ? `linear-gradient(135deg, ${currentAvatar.bgFrom}, ${currentAvatar.bgTo})`
              : 'linear-gradient(135deg, hsl(248 28% 14%), hsl(248 24% 10%))',
            border: currentAvatar
              ? `2px solid ${currentAvatar.borderColor}`
              : '2px solid hsl(248 16% 22%)',
            color: currentAvatar?.textColor ?? 'hsl(248 10% 55%)',
            fontSize: '2rem',
            lineHeight: 1,
            boxShadow: currentAvatar ? `0 0 20px ${currentAvatar.bgFrom}40` : 'none',
          }}
        >
          {currentAvatar?.symbol ?? '◯'}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-primary text-sm px-5 py-3"
          style={{ minHeight: '48px' }}
        >
          Changer
        </button>
      </div>

      {/* Modal galerie — plein écran sur mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'hsl(var(--background))',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid hsl(248 22% 14%)' }}
          >
            <div>
              <h3 className="font-serif text-2xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
                Choisis ton avatar
              </h3>
              <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 50%)' }}>
                {GALLERY_AVATARS.length} avatars disponibles
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 rounded-full flex items-center justify-center text-2xl transition-all hover:bg-surface-elevated active:scale-95"
              style={{
                color: 'hsl(248 10% 50%)',
                minHeight: '48px',
                minWidth: '48px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Filtres palette — plus visibles */}
          <div
            className="flex gap-2 px-4 py-4 overflow-x-auto flex-shrink-0"
            style={{
              borderBottom: '1px solid hsl(248 22% 14%)',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className={`text-sm px-4 py-2 rounded-full font-medium flex-shrink-0 transition-all ${activeFilter === null ? 'badge-gold' : 'badge-muted'}`}
            >
              Tous
            </button>
            {PALETTE_NAMES.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveFilter(activeFilter === i ? null : i)}
                className="text-sm px-4 py-2 rounded-full font-medium flex-shrink-0 transition-all badge-muted"
                style={{
                  ...(activeFilter === i && {
                    background: `${PALETTE_COLORS[i]}18`,
                    color: PALETTE_COLORS[i],
                    border: `1px solid ${PALETTE_COLORS[i]}40`,
                  }),
                }}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Grille — zones de frappe augmentées */}
          <div
            className="flex-1 overflow-y-auto px-4 py-6"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="grid grid-cols-4 gap-3 auto-rows-max">
              {filtered.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelect(avatar.id)}
                  disabled={saving}
                  className="aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-150 hover:scale-105 active:scale-95 relative"
                  style={{
                    background: `linear-gradient(135deg, ${avatar.bgFrom}, ${avatar.bgTo})`,
                    border: selected === avatar.id
                      ? `3px solid ${avatar.textColor}`
                      : `2px solid ${avatar.borderColor}`,
                    color: avatar.textColor,
                    boxShadow: selected === avatar.id
                      ? `0 0 0 4px hsl(var(--background)), 0 0 24px ${avatar.textColor}40`
                      : `0 2px 8px hsl(246 40% 2% / 0.3)`,
                    opacity: saving ? 0.5 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    minHeight: '80px',
                  }}
                >
                  <span style={{ lineHeight: 1 }}>{avatar.symbol}</span>
                  {selected === avatar.id && (
                    <span
                      className="absolute bottom-2 right-2 text-sm leading-none font-bold"
                      style={{ color: avatar.textColor }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer — statut sauvegarde */}
          {saving && (
            <div
              className="px-4 py-4 text-center text-sm font-medium flex-shrink-0"
              style={{
                borderTop: '1px solid hsl(248 22% 14%)',
                color: 'hsl(38 52% 65%)',
              }}
            >
              ⏳ Sauvegarde en cours…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
