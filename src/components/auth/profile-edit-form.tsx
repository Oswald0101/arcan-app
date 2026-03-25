// src/components/auth/profile-edit-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/lib/auth/actions'
import { AvatarPicker } from '@/components/profile/avatar-picker'
import { setLangCookie } from '@/lib/i18n/use-lang'

interface ProfileEditFormProps {
  userId: string
  currentAvatarUrl?: string | null
  initialData: {
    displayName: string | null
    bio: string | null
    country: string | null
    city: string | null
    language: string
    isPublic: boolean
    showLocation: boolean
    showPath: boolean
    showGuide: boolean
    showLevel: boolean
  }
}

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
]

export function ProfileEditForm({ userId, currentAvatarUrl, initialData }: ProfileEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState(initialData)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateProfileAction(userId, {
        displayName: form.displayName || null,
        bio: form.bio || null,
        country: form.country || null,
        city: form.city || null,
        language: form.language as any,
        isPublic: form.isPublic,
        showLocation: form.showLocation,
        showPath: form.showPath,
        showGuide: form.showGuide,
        showLevel: form.showLevel,
      })
      if (result.success) {
        // Synchroniser le cookie de langue immédiatement
        setLangCookie(form.language as any)
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  const VISIBILITY_ITEMS = [
    { key: 'isPublic',      label: 'Profil public',             desc: 'Visible par tous les membres' },
    { key: 'showLocation',  label: 'Afficher la localisation',  desc: 'Pays et ville sur ton profil' },
    { key: 'showPath',      label: 'Afficher ma Voie',           desc: 'Voie active visible publiquement' },
    { key: 'showGuide',     label: 'Afficher mon Guide',         desc: 'Nom du guide IA sur ton profil' },
    { key: 'showLevel',     label: 'Afficher mon niveau',        desc: 'Niveau et progression publics' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Avatar picker */}
      <div
        className="card-elevated p-5 space-y-4"
      >
        <AvatarPicker userId={userId} currentAvatarUrl={currentAvatarUrl} />
      </div>

      {/* Infos principales */}
      <div className="card-elevated p-5 space-y-4">
        <p className="label-section">Informations</p>

        <div className="space-y-1.5">
          <label className="label-field">Nom affiché</label>
          <input
            value={form.displayName ?? ''}
            onChange={(e) => set('displayName', e.target.value)}
            disabled={isPending}
            className="input"
            placeholder="Ton nom visible"
            maxLength={50}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label-field">Bio</label>
          <textarea
            value={form.bio ?? ''}
            onChange={(e) => set('bio', e.target.value)}
            disabled={isPending}
            rows={3}
            maxLength={500}
            className="textarea"
            placeholder="Quelques mots sur ta Voie…"
          />
          <p className="text-xs" style={{ color: 'hsl(248 10% 40%)' }}>
            {(form.bio ?? '').length}/500
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="label-field">Pays</label>
            <input
              value={form.country ?? ''}
              onChange={(e) => set('country', e.target.value.slice(0, 2).toUpperCase())}
              disabled={isPending}
              className="input"
              placeholder="FR"
              maxLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <label className="label-field">Ville</label>
            <input
              value={form.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              disabled={isPending}
              className="input"
              placeholder="Paris"
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="label-field">Langue de l'interface</label>
          <select
            value={form.language}
            onChange={(e) => set('language', e.target.value)}
            disabled={isPending}
            className="select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <p className="text-xs" style={{ color: 'hsl(248 10% 40%)' }}>
            La langue du Guide IA s'adapte automatiquement.
          </p>
        </div>
      </div>

      {/* Visibilité */}
      <div className="card-elevated p-5 space-y-4">
        <p className="label-section">Visibilité du profil</p>
        <div className="space-y-1">
          {VISIBILITY_ITEMS.map(({ key, label, desc }) => (
            <label
              key={key}
              className="flex items-center justify-between py-3 cursor-pointer group"
              style={{ borderBottom: '1px solid hsl(248 20% 12%)' }}
            >
              <div>
                <p className="text-sm" style={{ color: 'hsl(38 18% 82%)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 44%)' }}>{desc}</p>
              </div>
              {/* Toggle custom */}
              <div className="relative flex-shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => set(key, e.target.checked)}
                  disabled={isPending}
                  className="sr-only"
                />
                <div
                  className="w-10 h-5.5 rounded-full transition-all duration-200 relative"
                  style={{
                    width: '40px',
                    height: '22px',
                    background: (form[key as keyof typeof form] as boolean)
                      ? 'hsl(38 52% 58%)'
                      : 'hsl(248 20% 18%)',
                    border: (form[key as keyof typeof form] as boolean)
                      ? '1px solid hsl(38 52% 50%)'
                      : '1px solid hsl(248 16% 26%)',
                    boxShadow: (form[key as keyof typeof form] as boolean)
                      ? '0 0 8px hsl(38 52% 58% / 0.3)'
                      : 'none',
                  }}
                >
                  <div
                    className="absolute top-0.5 rounded-full transition-all duration-200"
                    style={{
                      width: '18px',
                      height: '18px',
                      background: 'hsl(38 22% 92%)',
                      left: (form[key as keyof typeof form] as boolean) ? '19px' : '2px',
                      boxShadow: '0 1px 3px hsl(246 32% 4% / 0.4)',
                    }}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'hsl(0 68% 48% / 0.08)',
            border: '1px solid hsl(0 68% 48% / 0.2)',
            color: 'hsl(0 68% 68%)',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{
            background: 'hsl(150 50% 38% / 0.08)',
            border: '1px solid hsl(150 50% 38% / 0.2)',
            color: 'hsl(150 55% 58%)',
          }}
        >
          <span>✓</span>
          Profil mis à jour
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full"
      >
        {isPending ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
      </button>
    </form>
  )
}
