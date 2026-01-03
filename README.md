[![Publish Package](https://github.com/nhs04047/nestjs-io-ts/actions/workflows/publish.yml/badge.svg)](https://github.com/nhs04047/nestjs-io-ts/actions/workflows/publish.yml)

# nestjs-io-ts

A utility library that integrates [io-ts](https://github.com/gcanti/io-ts) with the [NestJS](https://nestjs.com/) framework for runtime type validation.

## Features

- **Validation Pipe**: Use `io-ts` for runtime type validation in NestJS controllers
- **DTO Creation**: Easily create DTOs using `io-ts` codecs with full TypeScript inference
- **Structured Error Responses**: Detailed, field-level validation error messages with error codes and suggestions
- **Custom Error Messages**: Customize validation messages with `withMessage` API
- **DTO Utilities**: Create Partial, Pick, Omit DTOs for flexible validation scenarios
- **Query String Coercion**: Automatically convert query strings to correct types
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

  // Automatically coerce query/param strings to correct types (default: false)
  coerceQueryStrings: true,
});

// With explicit codec
new IoTsValidationPipe(MyCodec);

// With codec and options
new IoTsValidationPipe(MyCodec, { validateTypes: ['body'] });
```

### Query String Coercion

When `coerceQueryStrings` is enabled, string values from query parameters are automatically converted:

- `"true"` / `"false"` → `boolean`
- `"123"` / `"3.14"` → `number`
- `"null"` → `null`
- `"undefined"` → `undefined`

```typescript
// ?page=1&limit=10&active=true becomes { page: 1, limit: 10, active: true }
@Get()
@UsePipes(new IoTsValidationPipe({ coerceQueryStrings: true }))
findAll(@Query() query: PaginationDto) {}
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
      "message": "Invalid email format",
      "code": "INVALID_EMAIL",
      "expected": "Email",
      "value": "invalid-email",
      "suggestion": "Please provide a valid email address (e.g., user@example.com)"
    },
    {
      "field": "age",
      "message": "Expected number but received string",
      "code": "INVALID_TYPE",
      "expected": "number",
      "value": "not-a-number",
      "suggestion": "Please provide a valid number"
    }
  ]
}
```

### Custom Error Messages

Use `withMessage` to customize validation messages:

```typescript
import { withMessage, Email } from 'nestjs-io-ts';
import * as t from 'io-ts';

const UserCodec = t.type({
  email: withMessage(Email, {
    invalid: 'Please enter a valid email address',
    required: 'Email is required',
  }),
  age: withMessage(t.number, {
    invalid: (value) => `Age must be a number, got ${typeof value}`,
  }),
});
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

## DTO Utilities

### Partial DTO

Create DTOs where all fields are optional (useful for PATCH endpoints):

```typescript
import { createPartialDto } from 'nestjs-io-ts';

const UserCodec = t.type({
  name: t.string,
  email: Email,
  age: t.number,
});

// All fields become optional
class UpdateUserDto extends createPartialDto(UserCodec) {}

@Patch(':id')
updateUser(@Body() dto: UpdateUserDto) {
  // dto.name, dto.email, dto.age are all optional
}
```

### Pick DTO

Create DTOs with only specific fields:

```typescript
import { createPickDto } from 'nestjs-io-ts';

// Only include email and name
class UserContactDto extends createPickDto(UserCodec, ['email', 'name']) {}
```

### Omit DTO

Create DTOs excluding specific fields:

```typescript
import { createOmitDto } from 'nestjs-io-ts';

// Exclude id and createdAt for creation
class CreateUserDto extends createOmitDto(UserCodec, ['id', 'createdAt']) {}
```

### Intersection DTO

Combine required and optional fields:

```typescript
import { createIntersectionDto } from 'nestjs-io-ts';

const RequiredFields = t.type({
  name: t.string,
  email: Email,
});

const OptionalFields = t.partial({
  age: t.number,
  bio: t.string,
});

class CreateUserDto extends createIntersectionDto(
  RequiredFields,
  OptionalFields,
) {}
// { name: string, email: Email, age?: number, bio?: string }
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
  - `coerceQueryStrings`: Auto-convert query strings to correct types (default: `false`)

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

### `withMessage(codec, messages)`

Wraps an io-ts codec with custom error messages.

- **Parameters**:
  - `codec` - An io-ts codec to wrap
  - `messages` - Custom error messages configuration or message function
- **Returns**: A new codec with custom error messages

### `createPartialDto(codec)`

Creates a DTO where all fields are optional.

- **Parameters**: `codec` - An io-ts `t.type` codec
- **Returns**: A new IoTsDto with all fields optional

### `createPickDto(codec, keys)`

Creates a DTO with only specified fields.

- **Parameters**:
  - `codec` - An io-ts `t.type` codec
  - `keys` - Array of keys to include
- **Returns**: A new IoTsDto with only the specified fields

### `createOmitDto(codec, keys)`

Creates a DTO excluding specified fields.

- **Parameters**:
  - `codec` - An io-ts `t.type` codec
  - `keys` - Array of keys to exclude
- **Returns**: A new IoTsDto without the specified fields

### `createIntersectionDto(codecA, codecB)`

Combines two codecs into one DTO.

- **Parameters**:
  - `codecA` - First io-ts codec
  - `codecB` - Second io-ts codec
- **Returns**: A new IoTsDto with combined fields

## License

MIT
