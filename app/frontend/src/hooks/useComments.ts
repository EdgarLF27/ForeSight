import { useState, useCallback, useEffect } from 'react';
import { commentsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Comment } from '@/types';
import { toast } from 'sonner';

export function useComments(ticketId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar nuevos comentarios vía WebSocket
  useEffect(() => {
    if (!ticketId) return;

    // Unirse a la sala del ticket
    socketService.joinTicket(ticketId);
    const socket = socketService.getSocket();
    
    if (!socket) return;

    const handleNewComment = (comment: Comment) => {
      console.log('⚡ WS: Nuevo comentario en ticket:', ticketId);
      setComments(prev => {
        if (prev.find(c => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
    };

    const handleCommentDeleted = (commentId: string) => {
      console.log('⚡ WS: Comentario eliminado:', commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    };

    socket.on('newComment', handleNewComment);
    socket.on('commentDeleted', handleCommentDeleted);

    return () => {
      socket.off('newComment', handleNewComment);
      socket.off('commentDeleted', handleCommentDeleted);
      socketService.leaveTicket(ticketId);
    };
  }, [ticketId]);

  const loadComments = useCallback(async (id?: string) => {
    const targetId = id || ticketId;
    if (!targetId) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await commentsApi.getByTicket(targetId);
      setComments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar comentarios');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  const addComment = useCallback(async (content: string, id?: string) => {
    const targetId = id || ticketId;
    if (!targetId) return;

    try {
      const { data } = await commentsApi.create({ content, ticketId: targetId });
      // El WS ya lo agregará, pero para una UI más fluida lo agregamos manual si no existe
      setComments(prev => {
        if (prev.find(c => c.id === data.id)) return prev;
        return [...prev, data];
      });
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar comentario');
      return false;
    }
  }, [ticketId]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar comentario');
      return false;
    }
  }, []);

  return {
    comments,
    isLoading,
    error,
    loadComments,
    addComment,
    deleteComment
  };
}
