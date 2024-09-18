import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from '../chat/chat.gateway';
import { RabbitMQModule } from './rabbitmq.module'; // Correct path if needed

@Module({
    imports: [forwardRef(() => RabbitMQModule)], // Forward reference to RabbitMQModule to handle circular dependency
    providers: [ChatGateway],
    exports: [ChatGateway], // Export ChatGateway if needed elsewhere
})
export class GatewayModule {}
