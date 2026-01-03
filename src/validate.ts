import * as t from 'io-ts';

import { IoTsDto, isIoTsDto } from './dto';
import { IoTsValidationException } from './exception';
import { ValidationError } from './types';

/**
 * Extracts the field path from an io-ts validation error context
 * @param context - The validation error context array
 * @returns The field path as a dot-separated string
 */
function getFieldPath(context: t.Context): string {
  return context
    .slice(1) // Skip the root context
    .map((c) => c.key)
    .filter((key) => key !== '') // Filter empty keys
    .join('.');
}

/**
 * Extracts the expected type from an io-ts validation error context
 * @param context - The validation error context array
 * @returns The expected type name
 */
function getExpectedType(context: t.Context): string {
  const lastContext = context[context.length - 1];
  return lastContext?.type?.name || 'unknown';
}

/**
 * Converts io-ts validation errors to structured ValidationError array
 * @param errors - Array of io-ts validation errors
 * @returns Array of structured ValidationError objects
 */
export function formatErrors(errors: t.Errors): Array<ValidationError> {
  const errorMap = new Map<string, ValidationError>();

  for (const error of errors) {
    const field = getFieldPath(error.context) || 'root';
    const expected = getExpectedType(error.context);
    const actualValue = error.value;

    // Avoid duplicate errors for the same field
    if (!errorMap.has(field)) {
      const actualType =
        actualValue === null
          ? 'null'
          : actualValue === undefined
            ? 'undefined'
            : Array.isArray(actualValue)
              ? 'array'
              : typeof actualValue;

      errorMap.set(field, {
        field,
        message: `Expected ${expected} but received ${actualType}`,
        expected,
        value: actualValue,
      });
    }
  }

  return Array.from(errorMap.values());
}

/**
 * Decodes a value using an io-ts codec and throws IoTsValidationException on failure
 *
 * @param value - The value to decode
 * @param codecOrDto - The io-ts codec or IoTsDto class to use for validation
 * @returns The decoded value if successful
 * @throws IoTsValidationException if validation fails
 *
 * @example
 * ```typescript
 * const UserCodec = t.type({ name: t.string, age: t.number });
 * const validUser = decodeAndThrow({ name: 'John', age: 30 }, UserCodec);
 * ```
 *
 * @since 1.0.0
 */
export function decodeAndThrow<A, O, I>(
  value: I,
  codecOrDto: t.Type<A, O, I> | IoTsDto<A, O, I>,
): A {
  const codec: t.Type<A, O, I> = isIoTsDto<A, O, I>(codecOrDto)
    ? codecOrDto.codec
    : codecOrDto;

  const decodedValue = codec.decode(value);
  if (decodedValue._tag === 'Left') {
    const errors = formatErrors(decodedValue.left);
    throw new IoTsValidationException(errors);
  }
  return decodedValue.right;
}
