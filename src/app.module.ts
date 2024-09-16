import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ChatGateway } from './chat/chat.gateway';
import { RabbitMQModule } from './modules/rabbitmq.module';


@Module({ // root module for the application
  imports: [ UsersModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  RabbitMQModule,],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
