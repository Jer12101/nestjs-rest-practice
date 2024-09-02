import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ResultSetHeader} from 'mysql2/promise';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.provider';


@Injectable()
export class UsersService {
    constructor(private databaseService: DatabaseService) {}

    async findAll(role?: 'SALES' | 'CLIENT' | 'ADMIN'){
        try {
            // check
            if (!role) Error('xxxx')
            let query = 'SELECT * FROM users';
            let values: any[] = [];
    
            if (role) {
                query += ' WHERE role = ?';
                values.push(role);
            }
    
            const [users] = await this.databaseService.query(query, values);
            return users;
        } catch (error) {
            console.error('Error occurred while fetching users:', error);
            throw new InternalServerErrorException('An error occurred while fetching users');
        }
    }

    async findOne(id: number) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [users] = await this.databaseService.query(query, [id]);
        
        let user = users[0];
        if (!user) throw new NotFoundException('User Not Found');
        return user;
    }

    async create(createUserDto: CreateUserDto) {
        // Check for identical email before creating the user
        const existingUser = await this.findUserByEmail(createUserDto.email);

        if (existingUser) {
            throw new BadRequestException('Email is already in use. Please use a different email address.');
        }
        // Check for default email before creating the user
        if (createUserDto.email === 'newuser@example.com') {
            throw new BadRequestException('Cannot save with default email. Please enter a valid email address.');
        }
        const query = 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)';
        const Param = []
        
        // Specify that the result is of type ResultSetHeader
        const [result] = await this.databaseService.query(query, [
            createUserDto?.name,
            createUserDto?.email,
            createUserDto?.role,
        ]);

        const resultSet = result as ResultSetHeader;

        // Log the result (which is a ResultSetHeader)
        console.log(result); // This will show the structure, including insertId, affectedRows, etc.
        return { id: resultSet.insertId, ...createUserDto }; // Safely access insertId
    }

    async udpate(id: number, updateUserDto: UpdateUserDto) {
        const existingUser = await this.findUserByEmail(updateUserDto.email);
        if (existingUser && existingUser.id !== id) {
            throw new BadRequestException('Email is already in use. Please use a different email address.');
        }


        // Check for default email before updating the user
        if (updateUserDto.email === 'newuser@example.com') {
            throw new BadRequestException('Cannot save with default email. Please enter a valid email address.');
        }
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

    // helper function to find a user by email
    private async findUserByEmail(email: string) {
        const query = 'SELECT * FROM users WHERE EMAIL = ?';
        const [users] = await this.databaseService.query(query, [email]);
        return users[0]; // returns undefined if no user is found
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
