import { Controller, Get, Param, Post, Body, Patch, Delete, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id') // GET /users/:id
    udpate(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateUserDto: UpdateUserDto) {
        return this.usersService.udpate(id, updateUserDto);
    }

    @Delete(':id') // GET /users/:id
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }
}
