import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    private users = [ // static data
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
    ]

    findAll(role?: 'SALES' | 'CLIENT' | 'ADMIN'){
        if (role) {
            return this.users.filter(user => user.role === role);
        }
        return this.users;
    }

    findOne(id: number) {
        const user = this.users.find(user => user.id === id);
        return user;
    }

    create(user: {name: string, email: string, role: 'SALES' | 'CLIENT' | 'ADMIN'}) {
        const usersByHighestID = [...this.users].sort((a, b) => b.id - a.id)
        const newUser = {
            id: usersByHighestID[0].id + 1, 
            ...user
        }
        this.users.push(newUser)
        return newUser
    }

    udpate(id: number, updatedUser: {name?: string, email?: string, role?: 'SALES' | 'CLIENT' | 'ADMIN'}) {
        this.users = this.users.map(user => {
            if(user.id === id) {
                return {...user, ...updatedUser}
            }
            return user
        })
        return this.findOne(id)
    }

    delete(id: number) {
        const removedUser = this.findOne(id)
        this.users = this.users.filter(user => user.id !== id)
        return removedUser
    }
}
