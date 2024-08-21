import { CreateUserDto } from  "./create-user.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateUserDto extends PartialType(CreateUserDto) { }
// we get all the benefits of the CreateUserDto but not all entries are needed