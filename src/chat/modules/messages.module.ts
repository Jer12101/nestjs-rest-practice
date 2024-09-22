import { Module } from '@nestjs/common';
import { MessagesController } from '../controller/messages.controller';
import { MessageDBService } from '../../services/messageDB.service'; // Import your DB service

@Module({
    controllers: [MessagesController],
    providers: [MessageDBService],
})
export class MessagesModule {}