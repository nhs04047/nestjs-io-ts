import { UsersControllerModule } from './controllers/users/users.controller.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UsersControllerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
