import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './modules/rabbitmq.module';
import { GatewayModule } from './modules/gateway.module'; // Ensure the correct paths


@Module({ // root module for the application
  imports: [ UsersModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  RabbitMQModule, GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
