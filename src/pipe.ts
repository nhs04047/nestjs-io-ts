import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Type } from 'io-ts';

import { IoTsDto, isIoTsDto } from './dto';
import { decodeAndThrow } from './validate';

/**
 * Options for configuring IoTsValidationPipe behavior
 * @since 1.0.0
 */
export interface IoTsValidationPipeOptions {
  /**
   * If true, allows values to pass through when no IoTsDto is found
   * If false (default), throws an error when validation cannot be performed
   * @default false
   */
  allowPassthrough?: boolean;

  /**
   * Argument types to validate. By default validates 'body', 'query', and 'param'
   * Set to undefined to validate all types
   * @default ['body', 'query', 'param']
   */
  validateTypes?: Array<'body' | 'query' | 'param' | 'custom'> | undefined;
}

const DEFAULT_OPTIONS: IoTsValidationPipeOptions = {
  allowPassthrough: false,
  validateTypes: ['body', 'query', 'param'],
};

/**
 * NestJS validation pipe that uses io-ts for runtime type checking
 *
 * Can be used in two modes:
 * 1. Explicit: Pass a codec or DTO class to the constructor
 * 2. Contextual: Use with DTO classes that extend createIoTsDto()
 *
 * @example
 * ```typescript
 * // Route-level with explicit DTO
 * @Post()
 * @UsePipes(new IoTsValidationPipe(CreateUserDto))
 * createUser(@Body() dto: CreateUserDto) { ... }
 *
 * // Route-level with contextual DTO (recommended)
 * @Post()
 * @UsePipes(IoTsValidationPipe)
 * createUser(@Body() dto: CreateUserDto) { ... }
 *
 * // Global pipe
 * app.useGlobalPipes(new IoTsValidationPipe());
 * ```
 *
 * @since 1.0.0
 */
@Injectable()
export class IoTsValidationPipe<A = unknown, O = unknown, I = unknown>
  implements PipeTransform<I, A | I>
{
  private readonly codecOrDto?: Type<A, O, I> | IoTsDto<A, O, I>;
  private readonly options: IoTsValidationPipeOptions;

  /**
   * Creates a new IoTsValidationPipe
   * @param codecOrDtoOrOptions - Optional codec, DTO class, or options object
   * @param options - Optional configuration options (only when first param is codec/DTO)
   */
  constructor(
    codecOrDtoOrOptions?:
      | Type<A, O, I>
      | IoTsDto<A, O, I>
      | IoTsValidationPipeOptions,
    options?: IoTsValidationPipeOptions,
  ) {
    // Handle different constructor signatures
    if (
      codecOrDtoOrOptions &&
      typeof codecOrDtoOrOptions === 'object' &&
      !('decode' in codecOrDtoOrOptions) &&
      !isIoTsDto(codecOrDtoOrOptions)
    ) {
      // First argument is options
      this.options = { ...DEFAULT_OPTIONS, ...codecOrDtoOrOptions };
      this.codecOrDto = undefined;
    } else {
      // First argument is codec or DTO
      this.codecOrDto = codecOrDtoOrOptions as
        | Type<A, O, I>
        | IoTsDto<A, O, I>
        | undefined;
      this.options = { ...DEFAULT_OPTIONS, ...options };
    }
  }

  /**
   * Transforms and validates the input value
   * @param value - The input value to transform
   * @param metadata - Argument metadata from NestJS
   * @returns The validated value
   * @throws IoTsValidationException if validation fails
   */
  public transform(value: I, metadata: ArgumentMetadata): A | I {
    // Check if this argument type should be validated
    if (
      this.options.validateTypes !== undefined &&
      !this.options.validateTypes.includes(
        metadata.type as 'body' | 'query' | 'param' | 'custom',
      )
    ) {
      return value;
    }

    // Use explicit codec/DTO if provided
    if (this.codecOrDto) {
      return decodeAndThrow(value, this.codecOrDto);
    }

    // Try to get DTO from metadata
    const { metatype } = metadata;

    if (!metatype || !isIoTsDto(metatype)) {
      if (this.options.allowPassthrough) {
        return value;
      }

      // Skip validation for primitive types
      if (this.isPrimitiveType(metatype)) {
        return value;
      }

      // If metatype exists but isn't an IoTsDto, and we're not allowing passthrough
      if (metatype && !this.options.allowPassthrough) {
        console.warn(
          `[IoTsValidationPipe] Parameter type "${metatype.name}" is not an IoTsDto. ` +
            `Use createIoTsDto() to create validatable DTOs, or set allowPassthrough: true.`,
        );
      }

      return value;
    }

    return decodeAndThrow(value, metatype.codec) as A;
  }

  /**
   * Checks if a type is a primitive type that shouldn't be validated
   */
  private isPrimitiveType(metatype: ArgumentMetadata['metatype']): boolean {
    const primitiveTypes: Array<
      | StringConstructor
      | BooleanConstructor
      | NumberConstructor
      | ArrayConstructor
      | ObjectConstructor
    > = [String, Boolean, Number, Array, Object];
    return (
      !metatype ||
      primitiveTypes.includes(
        metatype as
          | StringConstructor
          | BooleanConstructor
          | NumberConstructor
          | ArrayConstructor
          | ObjectConstructor,
      )
    );
  }
}
