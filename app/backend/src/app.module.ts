import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AreasModule } from './areas/areas.module';
import { MeetingsModule } from './meetings/meetings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ReportsModule } from './reports/reports.module';
import { AppController } from './app.controller';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    EventsModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    TicketsModule,
    CommentsModule,
    RolesModule,
    PermissionsModule,
    AreasModule, 
    MeetingsModule,
    NotificationsModule,
    AiModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*path'); // Nueva sintaxis para capturar todas las rutas en NestJS 11
  }
}
