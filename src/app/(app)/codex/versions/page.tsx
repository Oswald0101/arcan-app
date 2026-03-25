// src/app/codex/versions/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCodex, getCodexVersions } from '@/lib/supabase/queries/codex'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Versions du Codex — Voie' }

export default async function CodexVersionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const codex = await getUserCodex(user.id)
  if (!codex) redirect('/codex')

  const versions = await getCodexVersions(codex.id, user.id) ?? []

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/codex" className="text-muted-foreground hover:text-foreground text-sm">← Codex</Link>
        <h1 className="text-xl font-medium">Historique</h1>
      </div>

      <div className="space-y-2">
        {versions.map((v: any) => (
          <Link
            key={v.id}
            href={`/codex/versions/${v.id}`}
            className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/40"
          >
            <div>
              <p className="text-sm font-medium">Version {v.versionNumber}</p>
              <p className="text-xs text-muted-foreground">
                {v.title}
                {v.summary && ` — ${v.summary}`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground flex-shrink-0 ml-3">
              {new Date(v.createdAt).toLocaleDateString('fr')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
