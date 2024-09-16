import { Module } from '@nestjs/common';
import { RabbitMQService } from '../services/rabbitmq.service'; // Ensure correct path to your service

@Module({
    providers: [RabbitMQService],
    exports: [RabbitMQService], // Export to make it available in other modules
})
export class RabbitMQModule {}
