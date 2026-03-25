import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción debería restringirse a la URL del frontend
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extraer el token de la cabecera, del query parameter o auth
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Guardar el payload en la conexión
      client.data.user = payload;
      
      // Unir al usuario a una sala personal (para notificaciones directas)
      client.join(`user_${payload.sub}`);

      // Unir al usuario a la sala de su empresa (para actualizaciones globales de la compañía)
      if (payload.companyId) {
        client.join(`company_${payload.companyId}`);
      }

      console.log(`Cliente conectado: ${client.id} (Usuario: ${payload.sub})`);
    } catch (error) {
      console.log(`Conexión rechazada: Token inválido para cliente ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Método para que un usuario se suscriba a los eventos de un ticket específico
  @SubscribeMessage('joinTicket')
  handleJoinTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: string) {
    if (ticketId) {
      client.join(`ticket_${ticketId}`);
      console.log(`Cliente ${client.id} se unió a la sala ticket_${ticketId}`);
    }
  }

  @SubscribeMessage('leaveTicket')
  handleLeaveTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: string) {
    if (ticketId) {
      client.leave(`ticket_${ticketId}`);
    }
  }
}
