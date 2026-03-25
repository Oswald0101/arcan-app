// src/components/progression/progression-widget.tsx
'use client'

import type { UserMemberProgress, UserPathProgress } from '@/types/paths'

interface ProgressionWidgetProps {
  memberProgress: UserMemberProgress | null
  pathProgress?: UserPathProgress | null
  pathName?: string
  compact?: boolean
}

export function ProgressionWidget({
  memberProgress,
  pathProgress,
  pathName,
  compact = false,
}: ProgressionWidgetProps) {
  if (!memberProgress) return null

  const level = memberProgress.currentLevel
  const nextLevelXp = level ? getNextLevelXp(level.requiredXp) : null
  const progressPercent = level && nextLevelXp
    ? Math.min(100, ((memberProgress.currentXp - level.requiredXp) / (nextLevelXp - level.requiredXp)) * 100)
    : 0

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="font-medium">{level?.title ?? `Niv. ${memberProgress.currentLevel}`}</span>
        </div>
        {memberProgress.streakDays > 0 && (
          <span className="text-muted-foreground">{memberProgress.streakDays}j</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Niveau plateforme */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{level?.title ?? 'Chercheur'}</span>
          <span className="text-muted-foreground">{memberProgress.currentXp} XP</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Niveau {memberProgress.currentLevel?.levelNumber ?? 1}</span>
          <span>Prochain : {nextLevelXp ? `${nextLevelXp} XP` : 'Max'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          value={memberProgress.streakDays}
          label="Jours consécutifs"
          highlight={memberProgress.streakDays >= 7}
        />
        <StatBox
          value={memberProgress.totalPracticesCompleted}
          label="Pratiques"
        />
        <StatBox
          value={memberProgress.totalChallengesCompleted}
          label="Épreuves"
        />
      </div>

      {/* Progression dans la voie */}
      {pathProgress && (
        <div className="rounded-xl border border-border p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{pathName ?? 'Ta Voie'}</span>
            <span>{pathProgress.rankXp} XP</span>
          </div>
          {pathProgress.currentRank && (
            <p className="text-sm font-medium">{pathProgress.currentRank.title}</p>
          )}
          {pathProgress.nextRank && (
            <div>
              <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/60 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (pathProgress.rankXp / pathProgress.nextRank.requiredXp) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Prochain rang : {pathProgress.nextRank.title} ({pathProgress.nextRank.requiredXp} XP requis)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${highlight ? 'border-foreground/30' : 'border-border'}`}>
      <p className="text-lg font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// Calcul simple XP nécessaire pour le niveau suivant
// (en prod, on chargerait les vrais levels depuis la DB)
function getNextLevelXp(currentRequiredXp: number): number | null {
  const levels = [0, 100, 300, 700, 1500, 3000, 5500, 9000, 14000, 21000]
  const idx = levels.indexOf(currentRequiredXp)
  return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : null
}
