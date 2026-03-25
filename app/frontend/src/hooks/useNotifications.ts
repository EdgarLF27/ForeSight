import { useState, useCallback, useEffect } from 'react';
import { notificationsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Notification } from '@/types';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Escuchar notificaciones vía WebSocket
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('⚡ WS: Nueva notificación:', notification.title);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar toast interactivo para avisar al usuario
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
        action: notification.link ? {
          label: 'Ver',
          onClick: () => console.log('Ir a:', notification.link)
        } : undefined
      });
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [isLoading]);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await notificationsApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (err) {
      console.error('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al marcar como leída');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas');
    }
  }, []);

  const deleteAll = useCallback(async () => {
    try {
      // Usamos el endpoint que sabemos que funciona (PUT mark-all-read)
      await notificationsApi.markAllAsRead();
      // Y limpiamos localmente para que el usuario las deje de ver
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Bandeja de entrada vaciada');
    } catch (err) {
      console.error('Error al vaciar notificaciones');
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteAll,
  };
}
