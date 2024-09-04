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
  // Map to keep track of connected clients and their usernames
  private clients: Map<string, string> = new Map(); // socket.id -> username

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connect: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Disconnect event triggered for socket: ${socket.id}`);
    const username = this.clients.get(socket.id); // Retrieve username associated with this socket
    if (username) {
      const leaveMessage: AddMessageDto = {
          author: 'System',
          body: `${username} has left the chat`,
      };
      this.logger.log(`Left message: ${leaveMessage.body}`);
      this.server.emit('message', leaveMessage); // Broadcast to all clients
      this.clients.delete(socket.id);
  } else {
      this.logger.log(`No username found for disconnected socket: ${socket.id}`);
  }
  }

  @SubscribeMessage('message') // subscribe to chat event mesages
  // front end and backend should subscribe to the same 'message' and not one to 'message' and one to 'chat'
  handleMessage(@MessageBody() message: AddMessageDto, @ConnectedSocket() client: Socket): void {
    this.logger.log(`Received message from ${message.author}:${" "}${message.body}`);
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
    this.clients.set(client.id, username); // Correctly associate the socket ID with the username
    const joinMessage: AddMessageDto = {
      author: 'System',
      body: `${username} has joined the chat`
    };
    this.logger.log(`Join message: ${joinMessage.body}`);
    client.emit('message', joinMessage);
    client.broadcast.emit('message', joinMessage);
  }
}
