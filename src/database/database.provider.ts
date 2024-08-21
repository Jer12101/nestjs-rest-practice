// database.providers.ts
import { createPool, Pool, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
    private pool : Pool;
    constructor() {
        this.pool = createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: parseInt(process.env.DB_PORT, 10),
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    

    async query<T extends RowDataPacket[] | ResultSetHeader>(sql: string, values?: any[]) : Promise<[T, any]> {
        return this.pool.query(sql, values);
    }
}