import { useState, useCallback } from 'react';
import { commentsApi } from '@/services/api';
import type { Comment } from '@/types';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async (ticketId: string) => {
    try {
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
      setComments(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al añadir comentario');
      return null;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      await commentsApi.delete(commentId);
      setComments(prev => prev.filter(c => t.id !== commentId));
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
