import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      // Dejamos que socket.io elija el mejor transporte
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔗 WebSocket conectado:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión WebSocket:', err.message);
    });
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
