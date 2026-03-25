'use client'

// src/components/intro/arcan-intro.tsx
// Expérience d'introduction ARCAN — 5 écrans, première connexion uniquement

import { useState, useEffect } from 'react'

const STORAGE_KEY = (userId: string) => `arcan_intro_seen_${userId}`

interface Screen {
  symbol: string
  label: string
  title: string
  body: string
}

const SCREENS: Screen[] = [
  {
    symbol: '◎',
    label: 'Bienvenue',
    title: 'Ce n\'est pas une application.',
    body: 'C\'est un espace. Un espace personnel pour explorer ce que tu es vraiment.',
  },
  {
    symbol: '◈',
    label: 'Connaissance',
    title: 'Des siècles de sagesse, distillés pour toi.',
    body: 'ARCAN s\'appuie sur des traditions, des philosophies et des systèmes humains. Sans t\'imposer quoi que ce soit.',
  },
  {
    symbol: '◉',
    label: 'Adaptation',
    title: 'ARCAN apprend à te connaître.',
    body: 'Tes réponses. Ta façon de penser. Ton rythme. Il s\'adapte à toi, pas l\'inverse.',
  },
  {
    symbol: '◇',
    label: 'Ta Voie',
    title: 'Ici, tu construis ta propre voie.',
    body: 'Unique. Personnelle. Évolutive. Personne d\'autre ne peut la définir pour toi.',
  },
  {
    symbol: '✦',
    label: 'Boussole',
    title: 'ARCAN devient ta boussole.',
    body: 'Pour réfléchir. Pour décider. Pour avancer — dans la direction qui est vraiment la tienne.',
  },
]

interface ArcanIntroProps {
  userId: string
}

export function ArcanIntro({ userId }: ArcanIntroProps) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [screenExiting, setScreenExiting] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY(userId))
      if (!seen) setVisible(true)
    } catch {
      // localStorage indisponible — pas d'intro
    }
  }, [userId])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY(userId), '1')
    } catch { /* silent */ }
    setExiting(true)
    setTimeout(() => setVisible(false), 400)
  }

  function next() {
    if (current === SCREENS.length - 1) {
      dismiss()
      return
    }
    setScreenExiting(true)
    setTimeout(() => {
      setCurrent(c => c + 1)
      setScreenExiting(false)
    }, 220)
  }

  if (!visible) return null

  const screen = SCREENS[current]
  const isLast = current === SCREENS.length - 1

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'hsl(246 40% 3% / 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.4s ease',
        padding: '32px 24px',
      }}
    >
      {/* Bouton passer */}
      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: 'hsl(248 10% 38%)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          transition: 'color 0.2s ease',
        }}
      >
        Passer
      </button>

      {/* Contenu principal */}
      <div
        style={{
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
          opacity: screenExiting ? 0 : 1,
          transform: screenExiting ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        {/* Symbole */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 30% 30%, hsl(38 52% 58% / 0.14), hsl(248 40% 6%))',
            border: '1px solid hsl(38 52% 58% / 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: 'hsl(38 58% 65%)',
            margin: '0 auto 32px',
            boxShadow: '0 0 40px hsl(38 52% 58% / 0.08)',
          }}
        >
          {screen.symbol}
        </div>

        {/* Label étape */}
        <p
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'hsl(38 52% 58% / 0.55)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {screen.label}
        </p>

        {/* Titre */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(24px, 7vw, 32px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'hsl(38 14% 92%)',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}
        >
          {screen.title}
        </h2>

        {/* Corps */}
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.65,
            color: 'hsl(248 10% 52%)',
            maxWidth: '300px',
            margin: '0 auto',
          }}
        >
          {screen.body}
        </p>
      </div>

      {/* Navigation bas */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '24px',
          right: '24px',
          maxWidth: '360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Indicateurs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {SCREENS.map((_, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                height: '3px',
                borderRadius: '3px',
                background: i === current
                  ? 'hsl(38 52% 62%)'
                  : 'hsl(248 22% 16%)',
                width: i === current ? '20px' : '6px',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Bouton suivant */}
        <button
          onClick={next}
          style={{
            width: '100%',
            maxWidth: '280px',
            padding: '14px 24px',
            borderRadius: '14px',
            background: isLast
              ? 'linear-gradient(135deg, hsl(38 55% 55%), hsl(38 48% 48%))'
              : 'hsl(38 52% 58% / 0.10)',
            border: `1px solid ${isLast ? 'hsl(38 52% 58% / 0.4)' : 'hsl(38 52% 58% / 0.22)'}`,
            color: 'hsl(38 14% 92%)',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </button>
      </div>
    </div>
  )
}

// Hook pour réafficher l'intro (depuis les paramètres profil)
export function resetIntro(userId: string) {
  try {
    localStorage.removeItem(STORAGE_KEY(userId))
  } catch { /* silent */ }
}
