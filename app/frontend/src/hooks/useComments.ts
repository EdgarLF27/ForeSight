import { useState, useCallback, useEffect } from 'react';
import { commentsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Comment } from '@/types';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !currentTicketId) return;

    socketService.joinTicket(currentTicketId);

    const handleNewComment = (newComment: Comment) => {
      setComments(prev => {
        if (prev.find(c => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });
    };

    const handleCommentDeleted = (deletedId: string) => {
      setComments(prev => prev.filter(c => c.id !== deletedId));
    };

    socket.on('newComment', handleNewComment);
    socket.on('commentDeleted', handleCommentDeleted);

    return () => {
      socket.off('newComment', handleNewComment);
      socket.off('commentDeleted', handleCommentDeleted);
      socketService.leaveTicket(currentTicketId);
    };
  }, [currentTicketId]);

  const loadComments = useCallback(async (ticketId: string) => {
    try {
      setCurrentTicketId(ticketId);
      setIsLoading(true);
      setError(null);
      const { data } = await commentsApi.getByTicket(ticketId);
      setComments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar comentarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(async (ticketId: string, content: string): Promise<Comment | null> => {
    try {
      const { data } = await commentsApi.create({ ticketId, content });
      setComments(prev => {
        if (prev.find(c => c.id === data.id)) return prev;
        return [...prev, data];
      });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al añadir comentario');
      return null;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      await commentsApi.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar comentario');
      return false;
    }
  }, []);

  return {
    comments,
    isLoading,
    error,
    loadComments,
    addComment,
    deleteComment,
  };
}
