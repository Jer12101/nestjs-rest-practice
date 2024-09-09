import {SubscribeMessage, 
        WebSocketGateway,
        WebSocketServer,
        MessageBody,
        ConnectedSocket,
        OnGatewayConnection,
        OnGatewayDisconnect,} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { createAdapter} from 'socketio-mq';
import { createClient } from 'redis';

import { AddMessageDto } from './dto/add-message.dto';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/', port: 3001, }) // allows connections from any origin

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  // Map to keep track of connected clients and their usernames
  private clients: Map<string, { username: string; roomId: string }> = new Map(); // socket.id -> username

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
  // front end and backend should subscribe to the same 'message' and not one to 'message' and one to 'chat'
  handleMessage(
    @MessageBody() data: {author: string; body: string; roomId: string}, 
    @ConnectedSocket() client: Socket): void {
      // Log the received data for debugging
      this.logger.log('Received data:', JSON.stringify(data));

      // Check if data is correctly received
      if (!data || !data.author || !data.body || !data.roomId) {
        this.logger.error('Received data is missing required fields:', data);
        return; // Exit early if data is malformed
      }
      const {author, body, roomId} = data;
      const message: AddMessageDto = {
        author,
        body,
      }
      this.logger.log(`Received message from ${author} in room ${roomId}:${" "}${message.body}`);
      this.server.to(roomId).emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: {username: string, roomId: string}, @ConnectedSocket() client: Socket): void {
    const {username, roomId} = data;
    this.clients.set(client.id, {username, roomId}); // Correctly associate the socket ID with the username
    client.join(roomId); 
    const joinMessage: AddMessageDto = {
      author: 'System',
      body: `${username} has joined room ${roomId}`,
    };
    this.logger.log(`Join message: ${joinMessage.body}`);
    client.to(roomId).emit('message', joinMessage);
    client.emit('message', joinMessage);
  }
}
