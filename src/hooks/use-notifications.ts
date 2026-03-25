// src/hooks/use-notifications.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  isRead: boolean
  entityType: string | null
  entityId: string | null
  createdAt: string
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

const POLL_INTERVAL = 30000

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  })

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setState({ notifications: data.notifications, unreadCount: data.unreadCount, isLoading: false })
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setState((prev) => ({
      ...prev,
      unreadCount: 0,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
    }))
  }, [])

  const markOneRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setState((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      notifications: prev.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    }))
  }, [])

  return { ...state, refresh: fetchNotifications, markAllRead, markOneRead }
}
