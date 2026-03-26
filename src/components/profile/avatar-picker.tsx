'use client'

// Refonte Ultra-Premium : Sélecteur d'avatar immersif avec glows et zones de frappe optimisées

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
    <div className="space-y-5">
      <span className="label-field">Avatar</span>

      {/* Aperçu + bouton ouvrir — ultra-premium */}
      <div className="flex items-center gap-5">
        <div
          className="h-24 w-24 rounded-full flex-shrink-0 flex items-center justify-center select-none transition-all duration-300 group"
          style={{
            background: currentAvatar
              ? `linear-gradient(135deg, ${currentAvatar.bgFrom}, ${currentAvatar.bgTo})`
              : 'linear-gradient(135deg, hsl(248 28% 14%), hsl(248 24% 10%))',
            border: currentAvatar
              ? `2.5px solid ${currentAvatar.borderColor}`
              : '2.5px solid hsl(248 16% 22%)',
            color: currentAvatar?.textColor ?? 'hsl(248 10% 55%)',
            fontSize: '2.5rem',
            lineHeight: 1,
            boxShadow: currentAvatar
              ? `0 0 32px ${currentAvatar.bgFrom}50, inset 0 1px 0 ${currentAvatar.textColor}15`
              : 'inset 0 1px 0 hsl(248 100% 100% / 0.05)',
          }}
        >
          {currentAvatar?.symbol ?? '◯'}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-primary text-base px-6 py-3 font-semibold"
          style={{ minHeight: '48px' }}
        >
          Changer
        </button>
      </div>

      {/* Modal galerie — plein écran sur mobile avec ambiance mystique */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'linear-gradient(135deg, hsl(246 40% 3%) 0%, hsl(250 40% 5%) 100%)',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          {/* Header — ultra-premium */}
          <div
            className="flex items-center justify-between px-5 py-5 flex-shrink-0"
            style={{
              borderBottom: '1.5px solid hsl(38 35% 25% / 0.15)',
              background: 'linear-gradient(to bottom, hsl(248 32% 10%) 0%, transparent 100%)',
            }}
          >
            <div>
              <h3 className="font-serif text-3xl font-medium" style={{ color: 'hsl(38 14% 95%)', textShadow: '0 2px 8px hsl(246 40% 2% / 0.30)' }}>
                Choisis ton avatar
              </h3>
              <p className="text-sm mt-2 font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
                {GALLERY_AVATARS.length} avatars disponibles
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-12 w-12 rounded-full flex items-center justify-center text-2xl transition-all hover:brightness-125 active:scale-95"
              style={{
                color: 'hsl(248 10% 55%)',
                minHeight: '48px',
                minWidth: '48px',
                background: 'hsl(248 28% 11%)',
                border: '1px solid hsl(248 22% 18%)',
              }}
            >
              ✕
            </button>
          </div>

          {/* Filtres palette — ultra-visibles */}
          <div
            className="flex gap-3 px-5 py-5 overflow-x-auto flex-shrink-0"
            style={{
              borderBottom: '1.5px solid hsl(38 35% 25% / 0.15)',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className={`text-sm px-5 py-2.5 rounded-full font-semibold flex-shrink-0 transition-all ${activeFilter === null ? 'badge-gold' : 'badge-muted'}`}
              style={{ minHeight: '40px' }}
            >
              Tous
            </button>
            {PALETTE_NAMES.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveFilter(activeFilter === i ? null : i)}
                className="text-sm px-5 py-2.5 rounded-full font-semibold flex-shrink-0 transition-all badge-muted"
                style={{
                  minHeight: '40px',
                  ...(activeFilter === i && {
                    background: `${PALETTE_COLORS[i]}18`,
                    color: PALETTE_COLORS[i],
                    border: `1.5px solid ${PALETTE_COLORS[i]}40`,
                  }),
                }}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Grille — zones de frappe 80px minimum */}
          <div
            className="flex-1 overflow-y-auto px-5 py-8"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="grid grid-cols-3 gap-5 auto-rows-max">
              {filtered.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelect(avatar.id)}
                  disabled={saving}
                  className="aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-200 hover:scale-110 active:scale-95 relative group"
                  style={{
                    background: `linear-gradient(135deg, ${avatar.bgFrom}, ${avatar.bgTo})`,
                    border: selected === avatar.id
                      ? `3px solid ${avatar.textColor}`
                      : `2px solid ${avatar.borderColor}`,
                    color: avatar.textColor,
                    boxShadow: selected === avatar.id
                      ? `0 0 0 5px hsl(246 40% 3%), 0 0 32px ${avatar.textColor}60, inset 0 1px 0 ${avatar.textColor}20`
                      : `0 4px 16px hsl(246 40% 2% / 0.40), inset 0 1px 0 ${avatar.textColor}10`,
                    opacity: saving ? 0.5 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    minHeight: '80px',
                  }}
                >
                  <span style={{ lineHeight: 1 }}>{avatar.symbol}</span>
                  {selected === avatar.id && (
                    <span
                      className="absolute bottom-3 right-3 text-lg leading-none font-bold animate-pulse"
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
              className="px-5 py-5 text-center text-sm font-semibold flex-shrink-0"
              style={{
                borderTop: '1.5px solid hsl(38 35% 25% / 0.15)',
                color: 'hsl(38 65% 75%)',
                background: 'linear-gradient(to top, hsl(248 32% 10%) 0%, transparent 100%)',
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
