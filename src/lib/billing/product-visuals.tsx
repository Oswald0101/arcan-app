// src/lib/billing/product-visuals.tsx
// Visuels générés CSS/SVG pour chaque produit ARCAN — pas d'images à héberger

import type { ProductCategory } from './boutique'

interface ProductVisualProps {
  productKey: string
  category: ProductCategory
  symbol: string
  isAccessible: boolean
  size?: 'sm' | 'md'
}

// Couleurs par catégorie
const CATEGORY_HUE: Record<ProductCategory, number> = {
  identite: 38,    // or
  experience: 248, // indigo
  codex: 195,      // cyan-bleu
  packs: 38,       // or (même que identite pour packs)
}

// Configuration visuelle par produit
const PRODUCT_CONFIG: Record<string, {
  rings: number
  dots: number
  hasInnerGlow: boolean
  rotation: number
}> = {
  avatar_pack_lumieres:   { rings: 2, dots: 8,  hasInnerGlow: true,  rotation: 0   },
  avatar_pack_ombres:     { rings: 2, dots: 6,  hasInnerGlow: false, rotation: 30  },
  avatar_pack_arcanes:    { rings: 3, dots: 12, hasInnerGlow: true,  rotation: 15  },
  guide_skin_oracle:      { rings: 2, dots: 0,  hasInnerGlow: true,  rotation: 0   },
  guide_skin_sphinx:      { rings: 1, dots: 4,  hasInnerGlow: false, rotation: 45  },
  guide_skin_ombre:       { rings: 1, dots: 0,  hasInnerGlow: false, rotation: 0   },
  theme_aube:             { rings: 2, dots: 6,  hasInnerGlow: true,  rotation: 60  },
  theme_minuit:           { rings: 3, dots: 10, hasInnerGlow: false, rotation: 20  },
  theme_feu_sacre:        { rings: 2, dots: 8,  hasInnerGlow: true,  rotation: 0   },
  theme_abime:            { rings: 2, dots: 4,  hasInnerGlow: false, rotation: 90  },
  codex_export_premium:   { rings: 1, dots: 0,  hasInnerGlow: true,  rotation: 0   },
  codex_edition_avancee:  { rings: 2, dots: 4,  hasInnerGlow: true,  rotation: 0   },
  codex_manifeste_enrichi:{ rings: 1, dots: 6,  hasInnerGlow: true,  rotation: 30  },
  pack_fondation:         { rings: 3, dots: 8,  hasInnerGlow: true,  rotation: 0   },
  pack_initie:            { rings: 3, dots: 12, hasInnerGlow: true,  rotation: 20  },
  pack_revelation:        { rings: 4, dots: 16, hasInnerGlow: true,  rotation: 10  },
}

// Couleur primaire par produit (hsl valeurs)
const PRODUCT_COLOR: Record<string, { h: number; s: number; l: number }> = {
  avatar_pack_lumieres:   { h: 38,  s: 65, l: 65 },
  avatar_pack_ombres:     { h: 248, s: 20, l: 45 },
  avatar_pack_arcanes:    { h: 38,  s: 70, l: 58 },
  guide_skin_oracle:      { h: 195, s: 60, l: 62 },
  guide_skin_sphinx:      { h: 38,  s: 45, l: 50 },
  guide_skin_ombre:       { h: 248, s: 15, l: 35 },
  theme_aube:             { h: 280, s: 40, l: 65 },
  theme_minuit:           { h: 220, s: 55, l: 52 },
  theme_feu_sacre:        { h: 15,  s: 70, l: 52 },
  theme_abime:            { h: 150, s: 35, l: 30 },
  codex_export_premium:   { h: 38,  s: 52, l: 62 },
  codex_edition_avancee:  { h: 195, s: 55, l: 58 },
  codex_manifeste_enrichi:{ h: 38,  s: 48, l: 55 },
  pack_fondation:         { h: 38,  s: 58, l: 58 },
  pack_initie:            { h: 38,  s: 65, l: 60 },
  pack_revelation:        { h: 38,  s: 72, l: 62 },
}

export function ProductVisual({ productKey, symbol, isAccessible, size = 'md' }: ProductVisualProps) {
  const config = PRODUCT_CONFIG[productKey] ?? { rings: 1, dots: 4, hasInnerGlow: false, rotation: 0 }
  const color = PRODUCT_COLOR[productKey] ?? { h: 38, s: 52, l: 58 }

  const dim = size === 'sm' ? 72 : 96
  const cx = dim / 2
  const cy = dim / 2

  const baseOpacity = isAccessible ? 1 : 0.45
  const colorStr = `hsl(${color.h} ${color.s}% ${color.l}%)`
  const colorFaint = `hsl(${color.h} ${color.s}% ${color.l}% / 0.08)`
  const colorMid = `hsl(${color.h} ${color.s}% ${color.l}% / 0.16)`

  const radii = config.rings === 1 ? [cx * 0.7]
    : config.rings === 2 ? [cx * 0.5, cx * 0.75]
    : config.rings === 3 ? [cx * 0.38, cx * 0.58, cx * 0.78]
    : [cx * 0.3, cx * 0.48, cx * 0.65, cx * 0.82]

  return (
    <div
      style={{
        width: dim,
        height: dim,
        flexShrink: 0,
        position: 'relative',
        opacity: baseOpacity,
      }}
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Fond circulaire */}
        <circle cx={cx} cy={cy} r={cx - 2} fill={colorFaint} />

        {/* Glow intérieur si applicable */}
        {config.hasInnerGlow && (
          <circle
            cx={cx}
            cy={cy}
            r={cx * 0.4}
            fill={`hsl(${color.h} ${color.s}% ${color.l}% / 0.06)`}
          />
        )}

        {/* Anneaux */}
        {radii.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            stroke={`hsl(${color.h} ${color.s}% ${color.l}% / ${0.30 - i * 0.06})`}
            strokeWidth={i === 0 ? 1 : 0.6}
            strokeDasharray={i > 0 ? '3 4' : undefined}
          />
        ))}

        {/* Points orbitaux */}
        {config.dots > 0 && Array.from({ length: config.dots }).map((_, i) => {
          const angle = (i * 360 / config.dots + config.rotation) * (Math.PI / 180)
          const r = radii[0] ?? cx * 0.5
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={1.2}
              fill={`hsl(${color.h} ${color.s}% ${color.l}% / ${i % 3 === 0 ? 0.9 : 0.4})`}
            />
          )
        })}

        {/* Bordure extérieure */}
        <circle
          cx={cx}
          cy={cy}
          r={cx - 2}
          stroke={`hsl(${color.h} ${color.s}% ${color.l}% / 0.22)`}
          strokeWidth={1}
        />
      </svg>

      {/* Symbole au centre */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'sm' ? '20px' : '26px',
          color: colorStr,
          textShadow: config.hasInnerGlow
            ? `0 0 16px hsl(${color.h} ${color.s}% ${color.l}% / 0.6)`
            : 'none',
        }}
      >
        {symbol}
      </div>
    </div>
  )
}

// ── Preview avatars — grille de symboles pour les packs d'avatars ──────────────

const AVATAR_PACK_SYMBOLS: Record<string, string[]> = {
  avatar_pack_lumieres: ['◑', '◐', '◎', '○', '◉', '◇', '◈', '⊙', '✦', '◯'],
  avatar_pack_ombres:   ['◐', '◑', '◆', '●', '⬤', '◼', '▲', '◣', '◢', '◤'],
  avatar_pack_arcanes:  ['✦', '⊛', '◎', '◈', '⊙', '△', '◇', '✧', '⊕', '◬'],
}

export function AvatarPackPreview({ productKey, isAccessible }: { productKey: string; isAccessible: boolean }) {
  const symbols = AVATAR_PACK_SYMBOLS[productKey]
  if (!symbols) return null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '6px',
        padding: '12px',
        borderRadius: '12px',
        background: 'hsl(248 30% 4%)',
        border: '1px solid hsl(248 22% 10%)',
        opacity: isAccessible ? 1 : 0.65,
        marginTop: '10px',
      }}
    >
      {symbols.map((sym, i) => {
        const color = PRODUCT_COLOR[productKey] ?? { h: 38, s: 52, l: 58 }
        return (
          <div
            key={i}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '8px',
              background: `hsl(${color.h} ${color.s}% ${color.l}% / 0.07)`,
              border: `1px solid hsl(${color.h} ${color.s}% ${color.l}% / 0.12)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: `hsl(${color.h} ${color.s}% ${color.l}%)`,
            }}
          >
            {sym}
          </div>
        )
      })}
    </div>
  )
}

// ── Preview thèmes — palette de couleurs ────────────────────────────────────────

const THEME_SWATCHES: Record<string, { name: string; colors: string[] }> = {
  theme_aube:      { name: 'Aube',      colors: ['hsl(280 40% 65%)', 'hsl(38 58% 62%)', 'hsl(248 32% 12%)', 'hsl(280 30% 20%)'] },
  theme_minuit:    { name: 'Minuit',    colors: ['hsl(220 55% 52%)', 'hsl(220 70% 70%)', 'hsl(220 40% 8%)',  'hsl(220 50% 15%)'] },
  theme_feu_sacre: { name: 'Feu Sacré', colors: ['hsl(15 70% 52%)',  'hsl(38 72% 58%)',  'hsl(15 40% 8%)',   'hsl(15 50% 14%)'] },
  theme_abime:     { name: 'Abîme',     colors: ['hsl(150 35% 30%)', 'hsl(150 45% 45%)', 'hsl(150 25% 5%)',  'hsl(150 30% 10%)'] },
  theme_aube_premium: { name: 'Aube',   colors: ['hsl(280 40% 65%)', 'hsl(38 58% 62%)', 'hsl(248 32% 12%)', 'hsl(280 30% 20%)'] },
}

export function ThemePreview({ productKey, isAccessible }: { productKey: string; isAccessible: boolean }) {
  const swatch = THEME_SWATCHES[productKey]
  if (!swatch) return null

  return (
    <div
      style={{
        marginTop: '10px',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid hsl(248 22% 12%)',
        opacity: isAccessible ? 1 : 0.6,
      }}
    >
      {/* Barre de couleurs */}
      <div style={{ display: 'flex', height: '8px' }}>
        {swatch.colors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      {/* Mini interface simulée */}
      <div
        style={{
          background: swatch.colors[2],
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: swatch.colors[0],
            opacity: 0.8,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: '4px',
              width: '60%',
              borderRadius: '2px',
              background: swatch.colors[1],
              marginBottom: '3px',
              opacity: 0.7,
            }}
          />
          <div
            style={{
              height: '3px',
              width: '40%',
              borderRadius: '2px',
              background: swatch.colors[1],
              opacity: 0.3,
            }}
          />
        </div>
        <div
          style={{
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '2px 5px',
            borderRadius: '999px',
            background: `${swatch.colors[0]}22`,
            color: swatch.colors[1],
            border: `1px solid ${swatch.colors[0]}33`,
          }}
        >
          {swatch.name}
        </div>
      </div>
    </div>
  )
}

// ── Preview pack — liste des produits inclus ────────────────────────────────────

type PackItem = { symbol: string; label: string; color: { h: number; s: number; l: number } }

const PACK_CONTENTS: Record<string, PackItem[]> = {
  pack_fondation: [
    { symbol: '◑', label: 'Pack Lumières', color: { h: 38, s: 65, l: 65 } },
    { symbol: '◇', label: 'Thème Aube',    color: { h: 280, s: 40, l: 65 } },
  ],
  pack_initie: [
    { symbol: '✦', label: 'Pack Arcanes',   color: { h: 38, s: 70, l: 58 } },
    { symbol: '△', label: 'Guide Sphinx',   color: { h: 38, s: 45, l: 50 } },
    { symbol: '✧', label: 'Thème Minuit',   color: { h: 220, s: 55, l: 52 } },
  ],
  pack_revelation: [
    { symbol: '◑', label: 'Pack Lumières',    color: { h: 38, s: 65, l: 65 } },
    { symbol: '◐', label: 'Pack Ombres',      color: { h: 248, s: 20, l: 45 } },
    { symbol: '✦', label: 'Pack Arcanes',     color: { h: 38, s: 70, l: 58 } },
    { symbol: '⊙', label: 'Guide Oracle',     color: { h: 195, s: 60, l: 62 } },
    { symbol: '△', label: 'Guide Sphinx',     color: { h: 38, s: 45, l: 50 } },
    { symbol: '◈', label: 'Guide Ombre',      color: { h: 248, s: 15, l: 35 } },
    { symbol: '◇', label: 'Thème Aube',       color: { h: 280, s: 40, l: 65 } },
    { symbol: '✧', label: 'Thème Minuit',     color: { h: 220, s: 55, l: 52 } },
    { symbol: '◉', label: 'Thème Feu Sacré',  color: { h: 15, s: 70, l: 52 } },
    { symbol: '◆', label: 'Thème Abîme',      color: { h: 150, s: 35, l: 30 } },
    { symbol: '▣', label: 'Export PDF',        color: { h: 38, s: 52, l: 62 } },
    { symbol: '◫', label: 'Éd. Avancée',      color: { h: 195, s: 55, l: 58 } },
    { symbol: '◰', label: 'Manifeste Enrichi', color: { h: 38, s: 48, l: 55 } },
  ],
}

export function PackContentsPreview({ productKey, isAccessible }: { productKey: string; isAccessible: boolean }) {
  const items = PACK_CONTENTS[productKey]
  if (!items) return null

  return (
    <div style={{ marginTop: '10px' }}>
      <p
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'hsl(248 10% 36%)',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        Ce pack contient
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 8px',
              borderRadius: '8px',
              background: `hsl(${item.color.h} ${item.color.s}% ${item.color.l}% / 0.05)`,
              border: `1px solid hsl(${item.color.h} ${item.color.s}% ${item.color.l}% / 0.10)`,
              opacity: isAccessible ? 1 : 0.7,
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: `hsl(${item.color.h} ${item.color.s}% ${item.color.l}%)`,
                flexShrink: 0,
                width: '18px',
                textAlign: 'center',
              }}
            >
              {item.symbol}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'hsl(248 10% 56%)',
                flex: 1,
              }}
            >
              {item.label}
            </span>
            <span style={{ fontSize: '10px', color: 'hsl(248 10% 28%)' }}>✓</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Version "placeholder" si le produit n'a pas de config
export function ProductVisualFallback({ symbol, isAccessible }: { symbol: string; isAccessible: boolean }) {
  return (
    <div
      style={{
        width: 96,
        height: 96,
        flexShrink: 0,
        borderRadius: '50%',
        background: 'hsl(248 30% 8%)',
        border: '1px solid hsl(248 22% 14%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        color: isAccessible ? 'hsl(38 52% 58%)' : 'hsl(248 10% 32%)',
        opacity: isAccessible ? 1 : 0.5,
      }}
    >
      {symbol}
    </div>
  )
}
