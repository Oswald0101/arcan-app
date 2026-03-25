// src/components/notifications/notification-bell.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationBell() {
  const { unreadCount, notifications, markAllRead, markOneRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      markAllRead()
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Bouton cloche */}
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 2a6 6 0 00-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 00-6-6zM8 16a2 2 0 004 0H8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`border-b border-border px-4 py-3 last:border-0 ${
                    !notif.isRead ? 'bg-muted/20' : ''
                  }`}
                >
                  {notif.actionUrl ? (
                    <Link
                      href={notif.actionUrl}
                      onClick={() => {
                        markOneRead(notif.id)
                        setOpen(false)
                      }}
                      className="block space-y-0.5 hover:opacity-80"
                    >
                      <p className="text-sm font-medium leading-tight">{notif.title}</p>
                      {notif.body && (
                        <p className="text-xs text-muted-foreground">{notif.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(new Date(notif.createdAt))}
                      </p>
                    </Link>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-tight">{notif.title}</p>
                      {notif.body && (
                        <p className="text-xs text-muted-foreground">{notif.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(new Date(notif.createdAt))}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'À l\'instant'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}
