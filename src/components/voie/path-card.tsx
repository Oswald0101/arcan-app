// src/components/voie/path-card.tsx
'use client'

import Link from 'next/link'
import type { Path } from '@/types/paths'

interface PathCardProps {
  path: Pick<Path, 'id' | 'slug' | 'name' | 'canonicalType' | 'customTypeLabel' | 'shortDescription' | 'memberCount' | 'admissionMode'> & {
    manifestoPreview?: string | null
  }
  userStatus?: 'active' | 'pending' | null
}

export function PathCard({ path, userStatus }: PathCardProps) {
  const typeLabel = path.customTypeLabel ?? path.canonicalType

  return (
    <Link href={`/cercles/${path.slug}`}>
      <div className="group rounded-2xl border border-border bg-background p-5 space-y-3 transition-colors hover:border-foreground/30 hover:bg-muted/40">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {typeLabel}
            </p>
            <h3 className="font-medium truncate">{path.name}</h3>
          </div>
          <div className="flex-shrink-0">
            {userStatus === 'active' && (
              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium">
                Membre
              </span>
            )}
            {userStatus === 'pending' && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                En attente
              </span>
            )}
            {path.admissionMode === 'on_request' && !userStatus && (
              <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted-foreground">
                Sur demande
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {path.shortDescription}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{path.memberCount} membre{path.memberCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  )
}
