import * as t from 'io-ts';

import { createIoTsDto, IoTsDto } from './dto';

/**
 * Creates a partial DTO where all fields are optional
 *
 * Useful for PATCH endpoints where only some fields may be updated.
 *
 * @param codec - The io-ts codec (must be t.type or t.partial)
 * @returns A new IoTsDto class with all fields optional
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { createPartialDto, Email } from 'nestjs-io-ts';
 *
 * const UserCodec = t.type({
 *   name: t.string,
 *   email: Email,
 *   age: t.number,
 * });
 *
 * // All fields become optional
 * class UpdateUserDto extends createPartialDto(UserCodec) {}
 *
 * // In controller (PATCH endpoint):
 * @Patch(':id')
 * updateUser(@Body() dto: UpdateUserDto) {
 *   // dto.name, dto.email, dto.age are all optional
 * }
 * ```
 *
 * @since 1.1.0
 */
export function createPartialDto<P extends t.Props>(
  codec: t.TypeC<P>,
): IoTsDto<
  Partial<t.TypeOf<t.TypeC<P>>>,
  Partial<t.OutputOf<t.TypeC<P>>>,
  unknown
> {
  const partialCodec = t.partial(codec.props);
  return createIoTsDto(partialCodec);
}

/**
 * Creates a DTO with only specified fields from the original codec
 *
 * Useful for creating focused DTOs that only include necessary fields.
 *
 * @param codec - The io-ts codec (must be t.type)
 * @param keys - Array of keys to include in the new DTO
 * @returns A new IoTsDto class with only the specified fields
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { createPickDto, Email, UUID } from 'nestjs-io-ts';
 *
 * const UserCodec = t.type({
 *   id: UUID,
 *   name: t.string,
 *   email: Email,
 *   password: t.string,
 *   age: t.number,
 * });
 *
 * // Only include email and name
 * class UserContactDto extends createPickDto(UserCodec, ['email', 'name']) {}
 *
 * // In controller:
 * @Get(':id/contact')
 * getContact(): UserContactDto {
 *   // Returns only { email, name }
 * }
 * ```
 *
 * @since 1.1.0
 */
export function createPickDto<P extends t.Props, K extends keyof P>(
  codec: t.TypeC<P>,
  keys: Array<K>,
): IoTsDto<
  { [Key in K]: t.TypeOf<P[Key]> },
  { [Key in K]: t.OutputOf<P[Key]> },
  unknown
> {
  const pickedProps = {} as Pick<P, K>;

  for (const key of keys) {
    if (key in codec.props) {
      pickedProps[key] = codec.props[key];
    }
  }

  const pickedCodec = t.type(pickedProps);
  return createIoTsDto(pickedCodec) as IoTsDto<
    { [Key in K]: t.TypeOf<P[Key]> },
    { [Key in K]: t.OutputOf<P[Key]> },
    unknown
  >;
}

/**
 * Creates a DTO excluding specified fields from the original codec
 *
 * Useful for creating DTOs that omit sensitive or irrelevant fields.
 *
 * @param codec - The io-ts codec (must be t.type)
 * @param keys - Array of keys to exclude from the new DTO
 * @returns A new IoTsDto class without the specified fields
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { createOmitDto, Email, UUID } from 'nestjs-io-ts';
 *
 * const UserCodec = t.type({
 *   id: UUID,
 *   name: t.string,
 *   email: Email,
 *   password: t.string,
 *   createdAt: t.string,
 * });
 *
 * // Exclude id, password, and createdAt for creation
 * class CreateUserDto extends createOmitDto(UserCodec, ['id', 'password', 'createdAt']) {}
 *
 * // In controller:
 * @Post()
 * createUser(@Body() dto: CreateUserDto) {
 *   // dto has only { name, email }
 * }
 * ```
 *
 * @since 1.1.0
 */
export function createOmitDto<P extends t.Props, K extends keyof P>(
  codec: t.TypeC<P>,
  keys: Array<K>,
): IoTsDto<
  { [Key in Exclude<keyof P, K>]: t.TypeOf<P[Key]> },
  { [Key in Exclude<keyof P, K>]: t.OutputOf<P[Key]> },
  unknown
> {
  const keysSet = new Set<keyof P>(keys);
  const omittedProps = {} as Omit<P, K>;

  for (const key in codec.props) {
    if (!keysSet.has(key as keyof P)) {
      (omittedProps as Record<string, t.Mixed>)[key] = codec.props[key];
    }
  }

  const omittedCodec = t.type(omittedProps as t.Props);
  return createIoTsDto(omittedCodec) as IoTsDto<
    { [Key in Exclude<keyof P, K>]: t.TypeOf<P[Key]> },
    { [Key in Exclude<keyof P, K>]: t.OutputOf<P[Key]> },
    unknown
  >;
}

/**
 * Creates a DTO that combines required and optional fields
 *
 * Combines t.type (required) and t.partial (optional) for flexible DTOs.
 *
 * @param required - The io-ts codec for required fields
 * @param optional - The io-ts codec for optional fields
 * @returns A new IoTsDto class with combined fields
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { createIntersectionDto, Email } from 'nestjs-io-ts';
 *
 * const RequiredFields = t.type({
 *   email: Email,
 *   name: t.string,
 * });
 *
 * const OptionalFields = t.partial({
 *   age: t.number,
 *   bio: t.string,
 * });
 *
 * class CreateUserDto extends createIntersectionDto(RequiredFields, OptionalFields) {}
 * // { email: Email, name: string, age?: number, bio?: string }
 * ```
 *
 * @since 1.1.0
 */
export function createIntersectionDto<PA extends t.Props, PB extends t.Props>(
  codecA: t.TypeC<PA> | t.PartialC<PA>,
  codecB: t.TypeC<PB> | t.PartialC<PB>,
): IoTsDto<
  t.TypeOf<typeof codecA> & t.TypeOf<typeof codecB>,
  t.OutputOf<typeof codecA> & t.OutputOf<typeof codecB>,
  unknown
> {
  const intersectionCodec = t.intersection([codecA, codecB]);
  return createIoTsDto(intersectionCodec) as IoTsDto<
    t.TypeOf<typeof codecA> & t.TypeOf<typeof codecB>,
    t.OutputOf<typeof codecA> & t.OutputOf<typeof codecB>,
    unknown
  >;
}
