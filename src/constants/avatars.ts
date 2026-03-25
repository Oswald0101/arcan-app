// src/constants/avatars.ts
// Galerie de 50 avatars symboliques — 10 symboles × 5 palettes de couleur

export interface GalleryAvatar {
  id: number
  symbol: string
  bgFrom: string   // HSL start du gradient
  bgTo: string     // HSL end du gradient
  textColor: string
  borderColor: string
  name: string     // nom lisible
}

const SYMBOLS = ['◯', '◎', '✦', '◈', '⟡', '◆', '◉', '△', '✧', '✶']

// 5 palettes × 10 symboles = 50 avatars
const PALETTES = [
  {
    name: 'or',
    bgFrom:      'hsl(38 40% 12%)',
    bgTo:        'hsl(38 32% 16%)',
    textColor:   'hsl(38 62% 68%)',
    borderColor: 'hsl(38 52% 38% / 0.35)',
  },
  {
    name: 'violet',
    bgFrom:      'hsl(265 42% 12%)',
    bgTo:        'hsl(275 36% 16%)',
    textColor:   'hsl(265 60% 72%)',
    borderColor: 'hsl(265 55% 48% / 0.30)',
  },
  {
    name: 'jade',
    bgFrom:      'hsl(162 38% 10%)',
    bgTo:        'hsl(170 32% 14%)',
    textColor:   'hsl(162 55% 58%)',
    borderColor: 'hsl(162 45% 38% / 0.30)',
  },
  {
    name: 'rose',
    bgFrom:      'hsl(338 40% 12%)',
    bgTo:        'hsl(348 34% 16%)',
    textColor:   'hsl(338 60% 70%)',
    borderColor: 'hsl(338 50% 42% / 0.30)',
  },
  {
    name: 'ardoise',
    bgFrom:      'hsl(218 38% 12%)',
    bgTo:        'hsl(225 32% 16%)',
    textColor:   'hsl(218 55% 70%)',
    borderColor: 'hsl(218 50% 45% / 0.30)',
  },
]

export const GALLERY_AVATARS: GalleryAvatar[] = PALETTES.flatMap((palette, pi) =>
  SYMBOLS.map((symbol, si) => ({
    id: pi * 10 + si,
    symbol,
    bgFrom:      palette.bgFrom,
    bgTo:        palette.bgTo,
    textColor:   palette.textColor,
    borderColor: palette.borderColor,
    name:        `${palette.name}-${symbol}`,
  })),
)

/** Encode l'avatar galerie pour le champ `avatarUrl` en DB */
export function encodeGalleryAvatar(id: number): string {
  return `gallery:${id}`
}

/** Décode un `avatarUrl` de type galerie → objet avatar ou null */
export function decodeGalleryAvatar(avatarUrl: string | null | undefined): GalleryAvatar | null {
  if (!avatarUrl?.startsWith('gallery:')) return null
  const id = parseInt(avatarUrl.split(':')[1], 10)
  return GALLERY_AVATARS[id] ?? null
}

/** Génère un avatar aléatoire (pour défaut à l'inscription) */
export function randomGalleryAvatar(): GalleryAvatar {
  return GALLERY_AVATARS[Math.floor(Math.random() * GALLERY_AVATARS.length)]
}
