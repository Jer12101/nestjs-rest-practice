import {SubscribeMessage, 
        WebSocketGateway,
        WebSocketServer,
        MessageBody,
        ConnectedSocket,
        OnGatewayConnection,
        OnGatewayDisconnect,} from '@nestjs/websockets';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AddMessageDto } from './dto/add-message.dto';
import { RabbitMQService } from '../services/rabbitmq.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/', port: 3001, }) // allows connections from any origin

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  // Map to keep track of connected clients and their usernames
  private clients: Map<string, { username: string; roomId: string }> = new Map(); // socket.id -> username
  
  constructor(@Inject(forwardRef(()=> RabbitMQService)) private readonly rabbitMQService: RabbitMQService) {};

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connect: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Disconnect event triggered for socket: ${socket.id}`);
    const clientInfo = this.clients.get(socket.id); // Retrieve username associated with this socket
    if (clientInfo) {
      const { username, roomId } = clientInfo;
      const leaveMessage: AddMessageDto = {
          author: 'System',
          body: `${username} has left the chat`,
          roomId,
      };
      this.logger.log(`Left message: ${leaveMessage.body}`);
      this.server.to(roomId).emit('message', leaveMessage); // Broadcast to all clients
      this.clients.delete(socket.id);
    }
    else {
        this.logger.log(`No username found for disconnected socket: ${socket.id}`);
    }
  }

  @SubscribeMessage('message') // subscribe to chat event mesages
  // !! front end and back end should subscribe to the same 'message' and not one to 'message' and one to 'chat'
  async handleMessage(
    @MessageBody() data: {username: string; body: string; roomId: string}, 
    @ConnectedSocket() client: Socket): Promise<void> {
      // Log the received data for debugging
      this.logger.log('Received data:', JSON.stringify(data));

      // Check if data is correctly received
      if (!data || !data.username || !data.body || !data.roomId) {
        this.logger.error('Received data is missing required fields:', data);
        return; // Exit early if data is malformed
      }
      const {username, body, roomId} = data;
      const message: AddMessageDto = {
        author: username,
        body,
        roomId
      }
      // Emit the message to all clients immediately
      this.server.to(roomId).emit('message', message);
      // queue the message in RabbitMQ instead of broadcasting immediately
      await this.rabbitMQService.publishMessage(message);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: {username: string, roomId: string}, 
    @ConnectedSocket() client: Socket): void {
      const {username, roomId} = data;
      this.clients.set(client.id, {username, roomId}); // Correctly associate the socket ID with the username
      client.join(roomId); 
      const joinMessage: AddMessageDto = {
        author: 'System',
        body: `${username} has joined room ${roomId}`,
        roomId,
      };
      this.logger.log(`Join message: ${joinMessage.body}`);
      client.to(roomId).emit('message', joinMessage);
      client.emit('message', joinMessage);
    }
}
