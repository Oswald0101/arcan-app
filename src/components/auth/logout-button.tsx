// src/components/auth/logout-button.tsx
'use client'

import { useTransition } from 'react'
import { logout } from '@/lib/auth/actions'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      {isPending ? 'Déconnexion…' : (children ?? 'Se déconnecter')}
    </button>
  )
}
