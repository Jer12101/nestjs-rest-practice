import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto { // input validation types, or Data Transfer Objects
    // no id: create the id after we receive the data

    // These validations will also be adapted to updateUserDto

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(['SALES', 'CLIENT', 'ADMIN'], {
        message: 'Valid role required' // if not one of the types 
    })
    role: 'SALES' | 'CLIENT' | 'ADMIN';
}