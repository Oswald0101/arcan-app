// src/app/progression/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getUserMemberProgress,
  getPractices,
  getChallenges,
  getUserPracticeLogs,
  getUserChallengeLogs,
  getUserBadges,
  getUserPathProgress,
} from '@/lib/supabase/queries/progression'
import { prisma } from '@/lib/prisma'
import { PracticeItem } from '@/components/progression/practice-item'
import { ProgressionWidget } from '@/components/progression/progression-widget'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Progression — Voie' }

export default async function ProgressionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const activePath = await prisma.path.findFirst({
    where: { founderUserId: user.id, status: 'active' },
    select: { id: true, name: true },
  })

  const [
    memberProgress,
    practices,
    challenges,
    recentLogs,
    activeChallenges,
    badges,
    pathProgress,
  ] = await Promise.all([
    getUserMemberProgress(user.id),
    getPractices(activePath?.id),
    getChallenges(activePath?.id),
    getUserPracticeLogs(user.id, { limit: 10, since: new Date(Date.now() - 7 * 86400000) }),
    getUserChallengeLogs(user.id, { status: 'in_progress', limit: 5 }),
    getUserBadges(user.id),
    activePath ? getUserPathProgress(user.id, activePath.id) : Promise.resolve(null),
  ])

  // Pratiques faites aujourd'hui
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const doneTodayIds = new Set(
    recentLogs
      .filter((l: any) => new Date(l.loggedAt) >= todayStart)
      .map((l: any) => l.practiceId),
  )

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-8">
      <h1 className="text-xl font-medium">Progression</h1>

      {/* Widget progression */}
      <ProgressionWidget
        memberProgress={memberProgress as any}
        pathProgress={pathProgress as any}
        pathName={activePath?.name}
      />

      {/* Pratiques */}
      {practices.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Pratiques
          </p>
          <div className="space-y-2">
            {practices.map((practice: any) => (
              <PracticeItem
                key={practice.id}
                practice={practice}
                pathId={activePath?.id}
                isDoneToday={doneTodayIds.has(practice.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Épreuves en cours */}
      {activeChallenges.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Épreuves en cours
          </p>
          <div className="space-y-2">
            {activeChallenges.map((log: any) => (
              <div key={log.id} className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{log.challenge.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {log.challenge.difficulty} · +{log.challenge.xpReward} XP
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/10 text-amber-600 px-2 py-0.5 text-xs">En cours</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Démarré le {new Date(log.startedAt).toLocaleDateString('fr')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Épreuves disponibles */}
      {challenges.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Épreuves disponibles
          </p>
          <div className="space-y-2">
            {challenges
              .filter((c: any) => !activeChallenges.find((a: any) => a.challengeId === c.id))
              .slice(0, 5)
              .map((challenge: any) => (
                <div key={challenge.id} className="rounded-xl border border-border p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {challenge.description?.slice(0, 60)}
                      {(challenge.description?.length ?? 0) > 60 ? '…' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {challenge.difficulty} · +{challenge.xpReward} XP
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Badges ({badges.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((ub: any) => (
              <div key={ub.id} className="rounded-xl border border-border p-3 text-center space-y-1.5">
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-10 w-10 mx-auto" />
                ) : (
                  <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center text-lg">✦</div>
                )}
                <p className="text-xs font-medium">{ub.badge.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(ub.earnedAt).toLocaleDateString('fr')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
