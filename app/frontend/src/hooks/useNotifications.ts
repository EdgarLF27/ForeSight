import { useState, useCallback, useEffect } from 'react';
import { notificationsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import { toast } from 'sonner';
import type { Notification } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Mostrar una alerta toast para la notificación en tiempo real
      toast(notification.title, {
        description: notification.message,
      });
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error al marcar todas las notificaciones:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    loadNotifications,
    markRead,
    markAllRead,
  };
}
