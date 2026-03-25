// src/lib/social/actions.ts
// Server Actions pour le module social

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  sendContactRequest,
  respondToContactRequest,
  cancelContactRequest,
  removeContact,
  getOrCreateDirectConversation,
  sendDirectMessage,
  blockUser,
  unblockUser,
  createReport,
} from '@/lib/supabase/queries/social'
import type { ReportInput } from '@/types/social'
import { z } from 'zod'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ---- Map des erreurs métier vers messages utilisateur ----
function mapError(err: any, lang = 'fr'): string {
  const messages: Record<string, Record<string, string>> = {
    SELF_REQUEST:          { fr: 'Tu ne peux pas t\'envoyer une demande à toi-même', en: 'Cannot send request to yourself' },
    BLOCKED:               { fr: 'Action impossible avec ce membre', en: 'Action not possible with this member' },
    ALREADY_CONTACT:       { fr: 'Vous êtes déjà en contact', en: 'Already contacts' },
    REQUEST_ALREADY_EXISTS: { fr: 'Une demande est déjà en cours', en: 'A request is already pending' },
    REQUEST_NOT_FOUND:     { fr: 'Demande introuvable', en: 'Request not found' },
    NOT_CONTACTS:          { fr: 'Vous n\'êtes pas en contact', en: 'Not contacts' },
    CONVERSATION_NOT_FOUND:{ fr: 'Conversation introuvable', en: 'Conversation not found' },
    EMPTY_MESSAGE:         { fr: 'Message vide', en: 'Empty message' },
    MESSAGE_TOO_LONG:      { fr: 'Message trop long (2000 caractères max)', en: 'Message too long (2000 chars max)' },
    CONTACT_NOT_FOUND:     { fr: 'Contact introuvable', en: 'Contact not found' },
    SELF_BLOCK:            { fr: 'Tu ne peux pas te bloquer toi-même', en: 'Cannot block yourself' },
    REPORT_ALREADY_SUBMITTED: { fr: 'Tu as déjà signalé cet élément récemment', en: 'Already reported recently' },
  }
  const code = err?.message ?? 'UNKNOWN'
  return messages[code]?.[lang] ?? messages[code]?.['fr'] ?? 'Une erreur est survenue'
}

// ============================================================
// CONTACTS
// ============================================================

const SendRequestSchema = z.object({
  receiverUserId: z.string().uuid(),
  message: z.string().max(200).optional(),
})

export async function sendContactRequestAction(
  input: z.infer<typeof SendRequestSchema>,
): Promise<ActionResult<{ requestId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const parsed = SendRequestSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  try {
    const request = await sendContactRequest(user.id, parsed.data.receiverUserId, parsed.data.message)
    revalidatePath('/contacts')
    return { success: true, data: { requestId: request.id } }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

export async function respondToContactRequestAction(
  requestId: string,
  action: 'accept' | 'reject',
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const result = await respondToContactRequest(requestId, user.id, action)
    revalidatePath('/contacts')
    return { success: true, data: result }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

export async function cancelContactRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    await cancelContactRequest(requestId, user.id)
    revalidatePath('/contacts')
    return { success: true }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

export async function removeContactAction(otherUserId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    await removeContact(user.id, otherUserId)
    revalidatePath('/contacts')
    return { success: true }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

// ============================================================
// MESSAGES
// ============================================================

export async function openConversationAction(
  otherUserId: string,
): Promise<ActionResult<{ conversationId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const conv = await getOrCreateDirectConversation(user.id, otherUserId)
    return { success: true, data: { conversationId: conv.id } }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
})

export async function sendMessageAction(
  input: z.infer<typeof SendMessageSchema>,
): Promise<ActionResult<{ messageId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const parsed = SendMessageSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Message invalide' }

  try {
    const message = await sendDirectMessage({
      conversationId: parsed.data.conversationId,
      senderUserId: user.id,
      content: parsed.data.content,
    })
    return { success: true, data: { messageId: message.id } }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

// ============================================================
// BLOCAGE
// ============================================================

export async function blockUserAction(blockedUserId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    await blockUser(user.id, blockedUserId)
    revalidatePath('/contacts')
    return { success: true }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

export async function unblockUserAction(blockedUserId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    await unblockUser(user.id, blockedUserId)
    revalidatePath('/contacts')
    return { success: true }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}

// ============================================================
// SIGNALEMENT
// ============================================================

const ReportSchema = z.object({
  targetType: z.enum(['user', 'path', 'guide_message', 'direct_message', 'codex']),
  targetId: z.string().uuid(),
  reasonKey: z.string().min(1),
  detailsText: z.string().max(500).optional(),
})

export async function reportAction(input: ReportInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const parsed = ReportSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  try {
    await createReport({
      reporterUserId: user.id,
      ...parsed.data,
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: mapError(err) }
  }
}
