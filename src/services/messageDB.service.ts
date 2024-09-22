import { Injectable, Logger } from '@nestjs/common';
import { createPool, Pool, RowDataPacket } from 'mysql2/promise';


@Injectable()
export class MessageDBService {
    private readonly logger = new Logger(MessageDBService.name);
    private pool: Pool;

    constructor() {
        this.pool = createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10),
            queueLimit: 0,
        });
    }

    async insertMessage(
        senderId: string, 
        roomId: string | null, 
        body: string
    ): Promise<void> {
        const query = `
            INSERT INTO messages (sender_id, room_id, body, created_at)
            VALUES (?, ?, ?, NOW());
        `;
        try {
            const [result] = await this.pool.query(query, [senderId, roomId, body]);
            this.logger.log(`Message saved to database with result: ${JSON.stringify(result)}`);
        } catch (error) {
            this.logger.error('Error saving message to database', error);
        }
    }
    
    async getMessagesByRoom(roomId: string): Promise<RowDataPacket[]> {
        const query = `
            SELECT messages.body, messages.sender_id AS username, messages.created_at
            FROM messages
            WHERE messages.room_id = ?
            ORDER BY messages.created_at ASC;
        `;

        try {
            const [rows] = await this.pool.query<RowDataPacket[]>(query, [roomId]);
            return rows;
        } catch (error) {
            this.logger.error('Error fetching messages by room', error);
            throw error;
        }
    }

    async closePool(): Promise<void> {
        await this.pool.end();
        this.logger.log('Database connection pool closed');
    }
}
