import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class CreateUserDto { // input validation types, or Data Transfer Objects
    // no id: create the id after we receive the data

    // These validations will also be adapted to updateUserDto

    @IsString()
    @IsNotEmpty()
    @Length(1, 15)
    name: string;

    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' })
    @IsEmail()
    @Length(1, 25)
    email: string;

    @IsEnum(['SALES', 'CLIENT', 'ADMIN'], {
        message: 'Valid role required' // if not one of the types 
    })
    role: 'SALES' | 'CLIENT' | 'ADMIN';
}