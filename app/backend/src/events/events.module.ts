import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';

@Global() // Hacemos el módulo global para poder inyectar el gateway en cualquier servicio
@Module({
  imports: [JwtModule.register({})],
  providers: [EventsGateway],
  exports: [EventsGateway], // Lo exportamos para usarlo en TicketsService, CommentsService, etc.
})
export class EventsModule {}
