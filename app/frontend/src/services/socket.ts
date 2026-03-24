import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      this.socket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔗 WebSocket conectado:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 WebSocket desconectado');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinTicket(ticketId: string) {
    this.socket?.emit('joinTicket', ticketId);
  }

  leaveTicket(ticketId: string) {
    this.socket?.emit('leaveTicket', ticketId);
  }
}

export const socketService = new SocketService();
