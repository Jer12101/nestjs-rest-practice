import { Controller, Get, Param, Post, Body, Patch, Delete, Query } from '@nestjs/common';

@Controller('users') 
export class UsersController {
    /*
    GET /users
    GET /users/:id
    POST /users
    PATCH /users/:id (change the data associated with the id)
    DELETE /users/:id
    */

    @Get() // GET /users route
    findAll(@Query('role') role?: 'INTERN' | 'CLIENT' | 'ADMIN') {
        return [];
    }

    /*@Get('interns') // this cannot be routed behind :id
    findAllInterns() {
        return [];
    }*/

    @Get(':id') // GET /users/:id
    findOne(@Param('id') id: string) {
        return { id };
    }

    @Post()
    create(@Body() user: {}) {
        return {user};
    }

    @Patch(':id') // GET /users/:id
    udpate(@Param('id') id: string, @Body() userUpdate: {}) {
        return { id, ...userUpdate };
    }

    @Delete(':id') // GET /users/:id
    delete(@Param('id') id: string) {
        return { id };
    }
}
