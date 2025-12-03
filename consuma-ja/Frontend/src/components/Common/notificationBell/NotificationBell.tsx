import React, { useCallback, useMemo, useState } from 'react'
import { View, TouchableOpacity, Text, Modal, ActivityIndicator, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useNotifications, NotificationItem } from '../../../contexts/NotificationContext/notificationContext'
import { notificationBellStyles } from './notificationBell.styled'

type NotificationBellProps = {
  containerStyle?: any
  renderTrigger?: (params: { open: () => void; unreadCount: number; badgeLabel: string; defaultTrigger: React.ReactNode }) => React.ReactNode
}

const NotificationBell: React.FC<NotificationBellProps> = ({ containerStyle, renderTrigger }) => {
  const navigation = useNavigation<any>()
  const { notifications, unreadCount, isLoading, refreshNotifications, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    refreshNotifications()
    setIsOpen(true)
  }, [refreshNotifications])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const formatTimestamp = useCallback((value: string) => {
    try {
      const date = new Date(value)
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch (error) {
      return value
    }
  }, [])

  const handleNotificationPress = useCallback(
    async (notification: NotificationItem) => {
      try {
        if (!notification.lida) {
          await markAsRead(notification.notificacaoId)
        }
      } catch (error) {
        console.warn('[NotificationBell] Falha ao marcar notificação como lida', error)
      } finally {
        close()
      }

      const vendaId = notification.payload?.vendaId ?? notification.vendaId ?? null
      if (notification.rotaDestino) {
        navigation.navigate(notification.rotaDestino as never, vendaId ? ({ focusVendaId: vendaId } as never) : undefined)
      }
    },
    [markAsRead, close, navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <TouchableOpacity
        style={[
          notificationBellStyles.item,
          !item.lida && notificationBellStyles.itemUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.85}
      >
        <Text style={notificationBellStyles.itemTitle}>{item.titulo}</Text>
        <Text numberOfLines={2} style={notificationBellStyles.itemMessage}>
          {item.mensagem}
        </Text>
        <Text style={notificationBellStyles.itemTimestamp}>{formatTimestamp(item.dataCriacao)}</Text>
      </TouchableOpacity>
    ),
    [handleNotificationPress, formatTimestamp],
  )

  const badgeLabel = useMemo(() => (unreadCount > 9 ? '9+' : unreadCount.toString()), [unreadCount])

  const defaultTrigger = (
      <TouchableOpacity
        style={[notificationBellStyles.container, containerStyle]}
        onPress={open}
        activeOpacity={0.85}
      >
        <Ionicons name="notifications-outline" size={24} color="white" />
        {unreadCount > 0 && (
          <View style={notificationBellStyles.badge}>
            <Text style={notificationBellStyles.badgeText}>{badgeLabel}</Text>
          </View>
        )}
      </TouchableOpacity>
  )

  return (
    <>
      {renderTrigger ? renderTrigger({ open, unreadCount, badgeLabel, defaultTrigger }) : defaultTrigger}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <View style={notificationBellStyles.modalOverlay}>
          <TouchableOpacity style={notificationBellStyles.modalBackdrop} activeOpacity={1} onPress={close} />
          <View style={notificationBellStyles.modalContent}>
            <View style={notificationBellStyles.header}>
              <Text style={notificationBellStyles.headerTitle}>Notificações</Text>
              <TouchableOpacity style={notificationBellStyles.refreshButton} onPress={refreshNotifications}>
                <Ionicons name="refresh" size={18} color="#2F4F4F" />
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color="#2F4F4F" />
            ) : notifications.length === 0 ? (
              <View style={notificationBellStyles.emptyState}>
                <Text style={notificationBellStyles.emptyText}>Nenhuma notificação até o momento.</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.notificacaoId.toString()}
                renderItem={renderItem}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

export default NotificationBell
