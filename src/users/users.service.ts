import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader} from 'mysql2/promise';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.provider';


@Injectable()
export class UsersService {
    constructor(private databaseService: DatabaseService) {}

    async findAll(role?: 'SALES' | 'CLIENT' | 'ADMIN'){
        let query = 'SELECT * FROM users'; // MySQL syntax
        let values: any[] = [];

        if (role) {
            query += ' WHERE role = ?';
            values.push(role);
        }
        // Perform the database query
        const [users] = await this.databaseService.query(query, values); // 'users' is a local variable

        if (!users) {
            throw new NotFoundException('User Role Not Found');
        }
        return users;
    }

    async findOne(id: number) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [users] = await this.databaseService.query(query, [id]);
        
        let user = users[0];
        if (!user) throw new NotFoundException('User Not Found');
        return user;
    }

    async create(createUserDto: CreateUserDto) {
        const query = 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)';
        // Specify that the result is of type ResultSetHeader
        const [result] = await this.databaseService.query(query, [
            createUserDto.name,
            createUserDto.email,
            createUserDto.role,
        ]);

        const resultSet = result as ResultSetHeader;

        // Log the result (which is a ResultSetHeader)
        console.log(result); // This will show the structure, including insertId, affectedRows, etc.
        return { id: resultSet.insertId, ...createUserDto }; // Safely access insertId
    }

    async udpate(id: number, updateUserDto: UpdateUserDto) {
        const query = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
        await this.databaseService.query(query, [
            updateUserDto.name,
            updateUserDto.email,
            updateUserDto.role,
            id,
        ]);
        return this.findOne(id);
    }

    async delete(id: number) {
        const user = await this.findOne(id);
        const query = 'DELETE FROM users WHERE id = ?';
        await this.databaseService.query(query, [id]);
        return user;
    }

    /*private users = [ // static data
        {
            "id": 1,
            "name": "Jim Halpert",
            "email": "jh@dunder-mifflin.com",
            "role": "SALES"
        },
        {
            "id": 2,
            "name": "Michael Scott",
            "email": "MS@dunder-mifflin.com",
            "role": "ADMIN"
        },
        {
            "id": 3,
            "name": "Dwight Schrute",
            "email": "ds@dunder-mifflin.com",
            "role": "SALES"
        },
        {
            "id": 4,
            "name": "John Doe",
            "email": "jd@clients.com",
            "role": "CLIENT"
        },
        {
            "id": 5,
            "name": "John Doe Sr.",
            "email": "jds@dunder-mifflin.com",
            "role": "CLIENT"
        },
    ]*/
}
