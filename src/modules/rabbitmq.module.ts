import { Module, forwardRef } from '@nestjs/common';
import { RabbitMQService } from '../services/rabbitmq.service';
import { MessageDBService } from '../services/messageDB.service'; // Correct path if needed
import { GatewayModule } from './gateway.module'; // Import the GatewayModule

@Module({
    imports: [forwardRef(() => GatewayModule)], // Forward reference to GatewayModule to handle circular dependency
    providers: [RabbitMQService, MessageDBService],
    exports: [RabbitMQService], // Export RabbitMQService for use in other modules
})
export class RabbitMQModule {}
