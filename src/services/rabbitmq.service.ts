import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { MessageDBService } from './messageDB.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import { AddMessageDto } from '../chat/dto/add-message.dto'; // Import AddMessageDto


@Injectable()
export class RabbitMQService
implements OnModuleInit {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    private readonly QUEUE_NAME = 'messages_queue';
    
    constructor(
        private readonly messageDBService: MessageDBService,
        private readonly chatGateway: ChatGateway
    ) {}

    async onModuleInit() {
        await this.connectToRabbitMQ(); // will be declared later
        await this.consumeMessages(); // start consuming messages upon initialization
    }

    private async connectToRabbitMQ() {
        try {
            // Connect to RabbitMQ server
            this.connection = await amqp.connect('amqp://guest:guest@localhost'); // remmember to change the user credentials for proper privacy
            this.channel = await this.connection.createChannel();
            // Assert (create if not exists) a queue
            await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
            this.logger.log('Connected to RabbitMQ and queue asserted');
        }
        catch (error) {
            this.logger.error('Error connecting to RabbitMQ', error);
        }
        
    }

    async publishMessage(message: string) {
        try {
            // Send message to the RabbitMQ queue
            this.channel.sendToQueue(this.QUEUE_NAME, Buffer.from(message), {persistent: true,});
            // Ensures that the messages survive RabbitMQ restarts with persistent: true
            this.logger.log(`Message sent to queue: ${message}`);
        }
        catch (error) {
            this.logger.error('Failed to publish message', error);
        }
    }

    async consumeMessages() {
        try {
            await this.channel.consume(this.QUEUE_NAME, async (msg) => {
                if (msg != null) {
                    const messageContent = msg.content.toString();
                    this.logger.log(`Received message: ${messageContent}`);

                    // Parse the message content into AddMessageDto
                    let message: AddMessageDto;
                    try {
                        message = JSON.parse(messageContent) as AddMessageDto;
                        
                        // Validate the message structure
                        if (!message.author || !message.body) {
                            throw new Error('Invalid message format');
                        }
                    } catch (error) {
                        this.logger.error('Failed to parse message content into AddMessageDto', error);
                        this.channel.ack(msg);
                        return;
                    }

                    await this.messageDBService.insertMessage(message.body); // Offload to database
                    this.channel.ack(msg);

                    // Emit to WebSocket clients through ChatGateway
                    this.chatGateway.broadcastMessageToClients(message);
                }
            });
        } catch (error) {
            this.logger.error('Failed to consume messages', error);
        }
    }

    private async offloadMessageToDatabase(message: string) {
        // Implement a logic to offload the message to a database
        this.logger.log(`Offloading message to database: ${message}`);
        // Example: use a database service to insert the message
        await this.messageDBService.insertMessage(message); // Use MessageDBService to save the message
    }

    private async closeRabbitMQConnection() {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            this.logger.log('RabbitMQ connection closed');
        } catch (error) {
            this.logger.error('Error closing RabbitMQ connection', error);
        }
    }


}