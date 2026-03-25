// src/components/onboarding/progress-bar.tsx

interface ProgressBarProps {
  currentBloc: number
  totalBlocs: number
  lang?: string
}

const BLOC_NAMES: Record<string, string[]> = {
  fr: ['Intention', 'Profil', 'Sens', 'Cadre', 'Guide', 'Voie', 'Engagement', 'Génération'],
  en: ['Intention', 'Profile', 'Meaning', 'Structure', 'Guide', 'Path', 'Commitment', 'Generation'],
}

export function ProgressBar({ currentBloc, totalBlocs, lang = 'fr' }: ProgressBarProps) {
  const names = BLOC_NAMES[lang] ?? BLOC_NAMES['fr']
  const progress = (currentBloc - 1) / (totalBlocs - 1)

  return (
    <div className="space-y-3">
      {/* Barre de progression */}
      <div className="h-0.5 w-full rounded-full bg-border">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Étapes */}
      <div className="flex justify-between">
        {names.slice(0, totalBlocs).map((name, idx) => {
          const bloc = idx + 1
          const isCompleted = bloc < currentBloc
          const isCurrent = bloc === currentBloc

          return (
            <div key={bloc} className="flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  isCompleted
                    ? 'bg-foreground'
                    : isCurrent
                    ? 'bg-foreground ring-2 ring-foreground/30'
                    : 'bg-border'
                }`}
              />
              <span
                className={`hidden text-xs sm:block ${
                  isCurrent
                    ? 'font-medium text-foreground'
                    : isCompleted
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
