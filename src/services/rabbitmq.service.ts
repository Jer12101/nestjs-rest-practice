import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService
implements OnModuleInit {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.Connection;
    private channel: amqp.Channel;

    private readonly QUEUE_NAME = 'messages_queue';

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
            // Consume messages from the RabbitMQ queue
            await this.channel.consume(this.QUEUE_NAME, async (msg) => {
                if (msg != null) {
                    const message = msg.content.toString();
                    this.logger.log(`Received message: ${message}`);
                    // Offload the message to the database
                    await this.offloadMessageToDatabase(message);
                    this.channel.ack(msg);
                }
                
            });
        }

        catch (error) {
            this.logger.error('Failed to consume messages', error);
        }
    }

    private async offloadMessageToDatabase(message: string) {
        // Implement a logic to offload the message to a database
        this.logger.log(`Offloading message to database: ${message}`);
        // Example: use a database service to insert the message
        // await this.databaseService.insertMessage(message);
    }


}