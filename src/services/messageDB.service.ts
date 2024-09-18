import { Injectable, Logger } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';

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

    async insertMessage(content: string): Promise<void> {
        const query = 'INSERT INTO messages (content) VALUES (?)';
        try {
            const [result] = await this.pool.query(query, [content]);
            this.logger.log(`Message saved to database with result: ${JSON.stringify(result)}`);
        } catch (error) {
            this.logger.error('Error saving message to database', error);
        }
    }

    async closePool(): Promise<void> {
        await this.pool.end();
        this.logger.log('Database connection pool closed');
    }
}
