// src/app/codex/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserCodex } from '@/lib/supabase/queries/codex'
import { CodexEditor } from '@/components/codex/codex-editor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mon Codex — Voie' }

export default async function CodexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const codex = await getUserCodex(user.id)
  if (!codex) redirect('/onboarding')

  const content = (codex.currentVersionData?.content as any)?.raw_markdown ?? ''

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-medium">{codex.title}</h1>
          <p className="text-xs text-muted-foreground">
            Version {codex.currentVersion}
            {codex.currentVersionData && ` · ${new Date(codex.currentVersionData.createdAt).toLocaleDateString('fr')}`}
          </p>
        </div>
        <a
          href={`/codex/versions`}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Historique →
        </a>
      </div>

      <CodexEditor
        codexId={codex.id}
        initialContent={content}
        initialTitle={codex.title}
      />
    </div>
  )
}
