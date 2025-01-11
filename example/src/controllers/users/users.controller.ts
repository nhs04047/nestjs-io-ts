import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './users.controller.dto';

@Controller('users')
export class UsersController {
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
