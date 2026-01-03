[![Publish Package](https://github.com/nhs04047/nestjs-io-ts/actions/workflows/publish.yml/badge.svg)](https://github.com/nhs04047/nestjs-io-ts/actions/workflows/publish.yml)

# nestjs-io-ts

A utility library that integrates [io-ts](https://github.com/gcanti/io-ts) with the [NestJS](https://nestjs.com/) framework for runtime type validation.

## Features

- **Validation Pipe**: Use `io-ts` for runtime type validation in NestJS controllers
- **DTO Creation**: Easily create DTOs using `io-ts` codecs with full TypeScript inference
- **Structured Error Responses**: Detailed, field-level validation error messages
- **OpenAPI Integration**: Automatic OpenAPI schema generation from `io-ts` types
- **Built-in Types**: Pre-built branded types for common validations (Email, UUID, URL, Phone, etc.)

## Installation

```bash
npm install nestjs-io-ts io-ts fp-ts
```

## Quick Start

### 1. Create a DTO from an io-ts codec

```typescript
import * as t from 'io-ts';
import { createIoTsDto, Email } from 'nestjs-io-ts';

const CreateUserCodec = t.type({
  name: t.string,
  email: Email,
  age: t.union([t.number, t.undefined]),
});

export class CreateUserDto extends createIoTsDto(CreateUserCodec) {}
```

### 2. Use the DTO in a Controller

```typescript
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { IoTsValidationPipe } from 'nestjs-io-ts';

@Controller('users')
export class UsersController {
  @Post()
  @UsePipes(IoTsValidationPipe)
  createUser(@Body() dto: CreateUserDto) {
    // dto is fully typed and validated
    return dto;
  }
}
```

### 3. Global Pipe (Recommended)

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

## Validation Pipe Options

The `IoTsValidationPipe` accepts optional configuration:

```typescript
import { IoTsValidationPipe } from 'nestjs-io-ts';

// With options
new IoTsValidationPipe({
  // Allow non-IoTsDto types to pass through without validation
  allowPassthrough: true,

  // Only validate specific argument types (default: ['body', 'query', 'param'])
  validateTypes: ['body'],
});

// With explicit codec
new IoTsValidationPipe(MyCodec);

// With codec and options
new IoTsValidationPipe(MyCodec, { validateTypes: ['body'] });
```

## Error Response Format

When validation fails, the pipe throws an `IoTsValidationException` with structured error details:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errors": [
    {
      "field": "email",
      "message": "Expected Email but received string",
      "expected": "Email",
      "value": "invalid-email"
    },
    {
      "field": "age",
      "message": "Expected number but received string",
      "expected": "number",
      "value": "not-a-number"
    }
  ]
}
```

## Built-in Extended Types

### String Types

| Type              | Description                                | Example                                   |
| ----------------- | ------------------------------------------ | ----------------------------------------- |
| `Email`           | Valid email address (RFC 5322 subset)      | `user@example.com`                        |
| `UUID`            | UUID v1-5 format                           | `550e8400-e29b-41d4-a716-446655440000`    |
| `URL`             | HTTP/HTTPS URL                             | `https://example.com/path`                |
| `Phone`           | Phone number (E.164 compatible)            | `+1-234-567-8900`                         |
| `DateString`      | ISO 8601 date                              | `2024-01-15`                              |
| `DateTimeString`  | ISO 8601 datetime                          | `2024-01-15T10:30:00Z`                    |
| `IPv4`            | IPv4 address                               | `192.168.0.1`                             |
| `IPv6`            | IPv6 address                               | `2001:db8::ff00:42:8329`                  |
| `IP`              | IPv4 or IPv6 address                       | Either format                             |
| `NonEmptyString`  | Non-empty string                           | `hello`                                   |
| `TrimmedString`   | String without leading/trailing whitespace | `hello world`                             |
| `LowercaseString` | Lowercase only string                      | `hello`                                   |
| `UppercaseString` | Uppercase only string                      | `HELLO`                                   |
| `HexColor`        | Hex color code                             | `#ff0000` or `#f00`                       |
| `Slug`            | URL-safe slug                              | `my-blog-post-123`                        |
| `Base64`          | Base64 encoded string                      | `SGVsbG8gV29ybGQ=`                        |
| `JWT`             | JSON Web Token format                      | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Number Types

| Type                | Description                 | Example   |
| ------------------- | --------------------------- | --------- |
| `Integer`           | Integer (no decimals)       | `42`      |
| `PositiveNumber`    | Number > 0                  | `3.14`    |
| `NonNegativeNumber` | Number >= 0                 | `0`, `42` |
| `PositiveInteger`   | Integer > 0                 | `1`, `42` |
| `Port`              | Valid port number (0-65535) | `8080`    |
| `Percentage`        | Number between 0-100        | `75.5`    |

### Usage Example

```typescript
import * as t from 'io-ts';
import {
  createIoTsDto,
  Email,
  UUID,
  Phone,
  DateString,
  Port,
  NonEmptyString,
} from 'nestjs-io-ts';

const UserProfileCodec = t.type({
  id: UUID,
  email: Email,
  phone: t.union([Phone, t.undefined]),
  displayName: NonEmptyString,
  birthDate: t.union([DateString, t.undefined]),
});

export class UserProfileDto extends createIoTsDto(UserProfileCodec) {}
```

## OpenAPI Integration

The library provides automatic OpenAPI schema generation from io-ts types:

```typescript
import { ioTsToOpenAPI } from 'nestjs-io-ts';
import * as t from 'io-ts';

const UserCodec = t.type({
  name: t.string,
  email: Email,
  age: t.number,
});

const schema = ioTsToOpenAPI(UserCodec);
// Returns:
// {
//   type: 'object',
//   properties: {
//     name: { type: 'string' },
//     email: { type: 'string', format: 'email' },
//     age: { type: 'number' }
//   },
//   required: ['name', 'email', 'age']
// }
```

Branded types are automatically mapped to OpenAPI formats:

| io-ts Type       | OpenAPI Format                              |
| ---------------- | ------------------------------------------- |
| `Email`          | `string` with `format: 'email'`             |
| `UUID`           | `string` with `format: 'uuid'`              |
| `URL`            | `string` with `format: 'uri'`               |
| `DateString`     | `string` with `format: 'date'`              |
| `DateTimeString` | `string` with `format: 'date-time'`         |
| `IPv4`           | `string` with `format: 'ipv4'`              |
| `IPv6`           | `string` with `format: 'ipv6'`              |
| `Integer`        | `integer`                                   |
| `Port`           | `integer` with `minimum: 0, maximum: 65535` |

## Manual Validation

You can also validate data manually without using the pipe:

```typescript
import { decodeAndThrow, IoTsValidationException } from 'nestjs-io-ts';
import * as t from 'io-ts';

const UserCodec = t.type({
  name: t.string,
  age: t.number,
});

try {
  const user = decodeAndThrow({ name: 'John', age: 30 }, UserCodec);
  console.log(user); // { name: 'John', age: 30 }
} catch (error) {
  if (error instanceof IoTsValidationException) {
    console.log(error.getErrors());
  }
}
```

Or use the DTO's static `create` method:

```typescript
import { createIoTsDto } from 'nestjs-io-ts';

const UserDto = createIoTsDto(UserCodec);

try {
  const user = UserDto.create({ name: 'John', age: 30 });
} catch (error) {
  // Handle validation error
}
```

## API Reference

### `createIoTsDto(codec)`

Creates a DTO class from an io-ts codec.

- **Parameters**: `codec` - An io-ts type codec
- **Returns**: A class that can be used as a DTO with validation

### `IoTsValidationPipe`

NestJS validation pipe for io-ts validation.

- **Constructor**: `new IoTsValidationPipe(codecOrOptions?, options?)`
- **Options**:
  - `allowPassthrough`: Allow non-IoTsDto types to pass through (default: `false`)
  - `validateTypes`: Argument types to validate (default: `['body', 'query', 'param']`)

### `IoTsValidationException`

Exception thrown when validation fails.

- **Methods**:
  - `getErrors()`: Returns array of `ValidationError` objects
  - `getResponse()`: Returns the full error response object

### `decodeAndThrow(value, codecOrDto)`

Validates a value and throws if validation fails.

- **Parameters**:
  - `value` - The value to validate
  - `codecOrDto` - An io-ts codec or IoTsDto class
- **Returns**: The decoded value
- **Throws**: `IoTsValidationException` if validation fails

### `ioTsToOpenAPI(codec)`

Converts an io-ts codec to an OpenAPI schema object.

- **Parameters**: `codec` - An io-ts type codec
- **Returns**: OpenAPI `SchemaObject`

### `isIoTsDto(obj)`

Type guard to check if an object is an IoTsDto class.

- **Parameters**: `obj` - The object to check
- **Returns**: `boolean`

## License

MIT
