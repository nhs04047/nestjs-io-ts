import * as t from 'io-ts';

import { IoTsValidationException } from './exception';
import { formatErrors } from './validate';

/**
 * Symbol used to identify IoTsDto classes
 * @internal
 */
export const IO_TS_DTO_SYMBOL = Symbol.for('nestjs-io-ts:dto');

/**
 * Interface representing a DTO class created from an io-ts codec
 *
 * @typeParam A - The decoded type (output type after successful validation)
 * @typeParam O - The encoded type (output type for serialization)
 * @typeParam I - The input type (type before validation, typically unknown)
 *
 * @since 1.0.0
 */
export interface IoTsDto<A, O, I> {
  /**
   * Constructor signature for the DTO class
   */
  new (): object;

  /**
   * The io-ts codec used for validation
   */
  codec: t.Type<A, O, I>;

  /**
   * Symbol marker to identify IoTsDto classes
   */
  [IO_TS_DTO_SYMBOL]: true;

  /**
   * Creates and validates a DTO instance from input data
   * @param input - The input data to validate
   * @returns The validated data
   * @throws IoTsValidationException if validation fails
   */
  create(input: I): A;
}

/**
 * Type guard to check if an object is an IoTsDto class
 *
 * @param obj - The object to check
 * @returns True if the object is an IoTsDto class
 *
 * @example
 * ```typescript
 * if (isIoTsDto(metatype)) {
 *   const decoded = decodeAndThrow(value, metatype.codec);
 * }
 * ```
 *
 * @since 1.0.0
 */
export function isIoTsDto<A = unknown, O = unknown, I = unknown>(
  obj: unknown,
): obj is IoTsDto<A, O, I> {
  if (obj === null || obj === undefined) {
    return false;
  }

  // Handle both objects and functions (classes are functions in JS)
  if (typeof obj !== 'object' && typeof obj !== 'function') {
    return false;
  }

  // Check if the object itself or any of its prototype chain has the marker
  // This handles both direct DTO classes and classes that extend them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  while (current !== null && current !== undefined) {
    if (
      IO_TS_DTO_SYMBOL in current &&
      current[IO_TS_DTO_SYMBOL] === true &&
      'codec' in current &&
      typeof current.codec === 'object' &&
      current.codec !== null &&
      typeof current.codec.decode === 'function'
    ) {
      return true;
    }
    current = Object.getPrototypeOf(current);
  }

  return false;
}

/**
 * Creates a DTO class from an io-ts codec
 *
 * The created DTO class can be used with IoTsValidationPipe for automatic validation
 * in NestJS controllers, and provides a static `create` method for manual validation.
 *
 * @param codec - The io-ts codec to use for validation
 * @returns A class that can be used as a DTO with io-ts validation
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { createIoTsDto } from 'nestjs-io-ts';
 *
 * const UserCodec = t.type({
 *   name: t.string,
 *   email: t.string,
 *   age: t.number,
 * });
 *
 * export class CreateUserDto extends createIoTsDto(UserCodec) {}
 *
 * // In controller:
 * @Post()
 * @UsePipes(IoTsValidationPipe)
 * createUser(@Body() dto: CreateUserDto) {
 *   // dto is validated and typed
 * }
 * ```
 *
 * @since 1.0.0
 */
export function createIoTsDto<A, O, I>(
  codec: t.Type<A, O, I>,
): IoTsDto<A, O, I> {
  if (!codec || typeof codec.decode !== 'function') {
    throw new Error('Invalid codec: must be a valid io-ts Type');
  }

  class AugmentedIoTsDto {
    public static readonly codec = codec;
    public static readonly [IO_TS_DTO_SYMBOL] = true as const;

    /**
     * Creates and validates data using the codec
     * @param input - The input data to validate
     * @returns The validated data
     * @throws IoTsValidationException if validation fails
     */
    public static create(input: I): A {
      const decodedInput = this.codec.decode(input);
      if (decodedInput._tag === 'Left') {
        const errors = formatErrors(decodedInput.left);
        throw new IoTsValidationException(errors);
      }
      return decodedInput.right;
    }
  }

  return AugmentedIoTsDto as IoTsDto<A, O, I>;
}
