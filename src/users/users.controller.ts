import { Controller, Get, Param, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users') 
export class UsersController {
    constructor(private readonly usersService: UsersService){}
    /*
    GET /users
    GET /users/:id
    POST /users
    PATCH /users/:id (change the data associated with the id)
    DELETE /users/:id
    */

    @Get() // GET /users route
    findAll(@Query('role') role?: 'SALES' | 'CLIENT' | 'ADMIN') {
        return this.usersService.findAll(role);
    }

    /*@Get('interns') // this cannot be routed behind :id
    findAllInterns() {
        return [];
    }*/

    @Get(':id') // GET /users/:id
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Post()
    create(@Body() user: {name: string, email: string, role: 'SALES' | 'CLIENT' | 'ADMIN'}) {
        return this.usersService.create(user);
    }

    @Patch(':id') // GET /users/:id
    udpate(@Param('id') id: string, @Body() userUpdate: {name?: string, email?: string, role?: 'SALES' | 'CLIENT' | 'ADMIN'}) {
        return this.usersService.udpate(+id, userUpdate);
    }

    @Delete(':id') // GET /users/:id
    delete(@Param('id') id: string) {
        return this.usersService.delete(+id);
    }
}
