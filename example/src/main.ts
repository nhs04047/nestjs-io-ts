import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { IoTsValidationPipe } from '../../src/pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new IoTsValidationPipe());
  await app.listen(3000);
}
bootstrap();
