import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.module';

@Module({
  controllers: [UsersController],
})
export class UsersControllerModule {}
