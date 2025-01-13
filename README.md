# nestjs-io-ts

**⚠️ This library is in development and experimental stages. Use may cause damage to application operation.**

## Description

`nestjs-io-ts` is a utility library that integrates `io-ts` with the NestJS framework. It provides tools and utilities to validate and transform data using `io-ts` in a NestJS application.

## Features

- **Validation Pipe**: Use `io-ts` for runtime type validation in NestJS.
- **DTO Creation**: Easily create DTOs using `io-ts` types.
- **Error Formatting**: Format validation errors for better readability.

## Installation

To install the dependencies, run:

```bash
$ npm install nestjs-io-ts io-ts
```

## Usage

### Creating DTO from io-ts type

```typescript
import * as t from 'io-ts';
import { createIoTsDto } from 'nestjs-io-ts';

const CreateUserDtoC = t.type({
  id: t.string,
  name: t.string,
  email: t.string,
  age: t.union([t.number, t.undefined]),
});

export class CreateUserDto extends createIoTsDto(CreateUserDtoC) {}
```

### Using DTO

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto, IotsValidationPipe } from './users.controller.dto';

@Controller('users')
export class UsersController {
  /* With global IotsValidationPipe */
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }

  /* With Route Level IotsValidationPipe */
  @Post()
  @UsePipes(IotsValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
```

### Using IotsValidationPipe

#### Locally

```typescript
import { IotsValidationPipe } from 'nestjs-io-ts';

// controller-level
@UsePipes()
class AuthController {}

class AuthController {
  // route-level
  @UsePipes(IotsValidationPipe)
  async signIn() {}
}
```

### Globally

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoTsValidationPipe } from 'nestjs-io-ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new IoTsValidationPipe());
  await app.listen(3000);
}
bootstrap();
```
