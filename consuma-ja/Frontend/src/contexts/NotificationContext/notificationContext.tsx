import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import orderService from '../../services/orderService'
import { useApplication } from '../ApplicationContext/ApplicationContext'

type NotificationPayload = Record<string, any> | null

export interface NotificationItem {
  notificacaoId: number
  titulo: string
  mensagem: string
  tipo: string
  destinatarioTipo: string
  vendaId?: number | null
  rotaDestino?: string | null
  payload?: NotificationPayload
  lida: boolean
  dataCriacao: string
}

interface NotificationContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
  limit?: number
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, limit = 25 }) => {
  const { user } = useApplication()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshNotifications = useCallback(async () => {
    if (!user?.pessoa_id) {
      setNotifications([])
      return
    }

    setIsLoading(true)
    try {
      const data = await orderService.listNotifications(user.pessoa_id, { limit })
      setNotifications(Array.isArray(data) ? (data as NotificationItem[]) : [])
    } catch (error) {
      console.error('[NotificationContext] Falha ao carregar notificações', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.pessoa_id, limit])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await orderService.markNotificationAsRead(notificationId)
      setNotifications((prev) => {
        const list = Array.isArray(prev) ? prev : []
        return list.map((notification) => (
          notification.notificacaoId === notificationId ? { ...notification, lida: true } : notification
        ))
      })
    } catch (error) {
      console.error('[NotificationContext] Falha ao marcar notificação como lida', error)
      throw error
    }
  }, [])

  const unreadCount = useMemo(() => {
    if (!Array.isArray(notifications)) {
      return 0
    }
    return notifications.filter((notification) => !notification.lida).length
  }, [notifications])

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
  }), [notifications, unreadCount, isLoading, refreshNotifications, markAsRead])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
