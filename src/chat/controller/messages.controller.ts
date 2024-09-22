import { Controller, Get, Query, Param, Logger } from "@nestjs/common";
import { MessageDBService } from "src/services/messageDB.service";

@Controller('messages')
export class MessagesController {
    private readonly logger = new Logger(MessagesController.name);

    constructor(private readonly messageDBService: MessageDBService) {}

    // Fetch messages for a specific room
    @Get('room/:roomId')
    async getMessagesByRoom(@Param('roomId') roomId: string) {
        this.logger.log(`Fetching messages for room: ${roomId}`);
        return await this.messageDBService.getMessagesByRoom(roomId);
    }

    // Fetch direct messages between two users
    /*@Get('direct')
    async getDirectMessages(
        @Query('senderId') senderId: string,
        @Query('recipientId') recipientId: string,
    ) {
        this.logger.log(`Fetching direct messages between ${senderId} and ${recipientId}`);
        return await this.messageDBService.getDirectMessages(senderId, recipientId);
    }*/
}