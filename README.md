[![Publish Package](https://github.com/nhs04047/nestjs-io-ts/actions/workflows/publish.yml/badge.svg)](https://github.com/nhs04047/nestjs-io-ts/actions/workflows/publish.yml)
# nestjs-io-ts

**⚠️ This library is in development and experimental stages. Use may cause damage to application operation.**

## Description

`nestjs-io-ts` is a utility library that integrates `io-ts` with the NestJS framework. It provides tools and utilities to validate and transform data using `io-ts` in a NestJS application.

## Features

- **Validation Pipe**: Use `io-ts` for runtime type validation in NestJS.
- **DTO Creation**: Easily create DTOs using `io-ts` types.
- **Error Formatting**: Format validation errors for better readability.
- **Custom Type Extensions**: Extend `io-ts` with reusable types.

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
import { CreateUserDto } from './users.controller.dto';
import { IotsValidationPipe } from 'nestjs-io-ts';

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

### Using Custom Extended Types for Validation

Below is a table summarizing the custom extended types for validation, their purpose, and features:
|Type|Description|Example|
|---|---|---|
|Email|Validates email addresses.|example@domain.com|
|IP|Validates IPv4 or IPv6 addresses.|192.168.0.1 or 2001:db8::ff00:42:8329|

#### Common Usage of Extended Types

You can use these types in DTOs by defining them with t.brand or as reusable custom types in io-ts. Here’s an example usage pattern:

Creating a DTO with Custom Types

```typescript
import * as t from 'io-ts';
import { createIoTsDto } from 'nestjs-io-ts';
import { Email, IP } from 'nestjs-io-ts';

const RegisterUserDtoC = t.type({
  email: Email,
  ip: IP,
  name: t.string,
});

export class RegisterUserDto extends createIoTsDto(RegisterUserDtoC) {}
```

#### Using the DTO in a Controller

```typescript
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { RegisterUserDto } from './users.controller.dto';
import { IotsValidationPipe } from 'nestjs-io-ts';

@Controller('users')
export class UsersController {
  @Post('register')
  @UsePipes(IotsValidationPipe)
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return {
      message: 'User registration data validated successfully',
      data: registerUserDto,
    };
  }
}
```

#### Common Validation Process

1. Define Custom Types: Extend t.brand for reusable custom types (Email, IP, etc.).
2. Compose DTOs: Use the custom types in your DTO definitions.
3. Validation with Pipe: Attach IotsValidationPipe globally or at the route level.
4. Error Handling: Automatically catch and format errors if the validation fails.
