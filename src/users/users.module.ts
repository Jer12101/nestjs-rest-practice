import { Module } from '@nestjs/common';
// import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseService } from 'src/database/database.provider';


@Module({
    providers: [UsersService, DatabaseService],
    exports: [UsersService],
})
export class UsersModule {}
