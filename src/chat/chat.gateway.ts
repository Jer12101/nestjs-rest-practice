import {SubscribeMessage, 
        WebSocketGateway,
        WebSocketServer,
        MessageBody,
        ConnectedSocket,
        OnGatewayConnection,
        OnGatewayDisconnect,} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { AddMessageDto } from './dto/add-message.dto';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/', port: 3001, }) // allows connections from any origin

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connect: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  @SubscribeMessage('message') // subscribe to chat event mesages
  // front end and backend should subscribe to the same 'message' and not one to 'message' and one to 'chat'
  handleMessage(@MessageBody() message: AddMessageDto, @ConnectedSocket() client: Socket): void {
    this.logger.log(`Received message from ${message.author}:${" "}${message.body}`);
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
    const joinMessage: AddMessageDto = {
      author: 'System',
      body: `${username} has joined the chat`
    };
    this.logger.log(`Join message: ${joinMessage.body}`);
    client.emit('message', joinMessage);
    client.broadcast.emit('message', joinMessage);
  }
}
