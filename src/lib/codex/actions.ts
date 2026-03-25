// src/lib/codex/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCodexVersion } from '@/lib/supabase/queries/codex'
import { z } from 'zod'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

const SaveCodexSchema = z.object({
  codexId: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(50000), // Markdown brut
  summary: z.string().max(200).optional(),
})

export async function saveCodexVersionAction(
  input: z.infer<typeof SaveCodexSchema>,
): Promise<ActionResult<{ versionId: string; versionNumber: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const parsed = SaveCodexSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  const result = await createCodexVersion({
    codexId: parsed.data.codexId,
    userId: user.id,
    title: parsed.data.title,
    content: { raw_markdown: parsed.data.content },
    summary: parsed.data.summary,
  })

  if (!result) return { success: false, error: 'Codex introuvable ou non autorisé' }

  revalidatePath('/codex')
  return { success: true, data: { versionId: result.id, versionNumber: result.versionNumber } }
}
