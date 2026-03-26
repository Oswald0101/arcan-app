// src/app/contacts/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContacts, getPendingRequestsReceived, getPendingRequestsSent } from '@/lib/supabase/queries/social'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contacts — Voie' }

/** Retourne true si le username est un placeholder auto-généré (user_xxxxxxxx) */
function isAutoUsername(username: string | null | undefined): boolean {
  if (!username) return true
  return /^user_[0-9a-f]{8}$/i.test(username)
}

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [contacts, received, sent] = await Promise.all([
    getContacts(user.id),
    getPendingRequestsReceived(user.id),
    getPendingRequestsSent(user.id),
  ])

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <h1 className="text-xl font-medium">Contacts</h1>

      {/* Demandes reçues */}
      {received.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Demandes reçues ({received.length})
          </p>
          {received.map((req: any) => {
            const username = req.sender?.profile?.username
            const displayName = req.sender?.profile?.displayName ?? username ?? '?'
            const showLink = !isAutoUsername(username)
            return (
              <div key={req.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                {showLink ? (
                  <Link href={`/profils/${username}`} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">@{username}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                )}
                <div className="flex gap-1.5">
                  <ContactRequestButtons requestId={req.id} />
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Contacts */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Contacts ({contacts.length})
        </p>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun contact pour l&apos;instant.</p>
        ) : (
          contacts.map((c: any) => {
            const username = c.profile?.username
            const displayName = c.profile?.displayName ?? username
            const showLink = !isAutoUsername(username)
            const inner = (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium overflow-hidden">
                  {c.profile?.avatarUrl ? (
                    <img src={c.profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (displayName ?? '?').slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{displayName}</p>
                  {!isAutoUsername(username) && (
                    <p className="text-xs text-muted-foreground">@{username}</p>
                  )}
                </div>
              </div>
            )
            return showLink ? (
              <Link
                key={c.contactId}
                href={`/profils/${username}`}
                className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/40"
              >
                {inner}
                <span className="text-xs text-muted-foreground">→</span>
              </Link>
            ) : (
              <div
                key={c.contactId}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                {inner}
              </div>
            )
          })
        )}
      </section>

      {/* Demandes envoyées */}
      {sent.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Demandes envoyées ({sent.length})
          </p>
          {sent.map((req: any) => {
            const username = req.receiver?.profile?.username
            const displayName = req.receiver?.profile?.displayName ?? username ?? '?'
            const showLink = !isAutoUsername(username)
            return (
              <div key={req.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                {showLink ? (
                  <Link href={`/profils/${username}`} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm">@{username}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm">{displayName}</span>
                  </div>
                )}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">En attente</span>
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}

// Client component minimal pour les boutons accept/reject
function ContactRequestButtons({ requestId }: { requestId: string }) {
  // Rendu côté serveur — actions via lien vers profil ou via Server Action
  // Pour le MVP : rediriger vers le profil qui a un ContactButton complet
  return (
    <span className="text-xs text-muted-foreground">Voir profil →</span>
  )
}
