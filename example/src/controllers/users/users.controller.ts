import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CreateUserDto } from './users.controller.dto';
import { IoTsValidationPipe } from 'nestjs-io-ts';

@Controller('users')
export class UsersController {
  @Post()
  @UsePipes(IoTsValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
