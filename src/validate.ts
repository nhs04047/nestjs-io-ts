import * as t from 'io-ts';

import { IoTsDto, isIoTsDto } from './dto';
import { IoTsValidationException } from './exception';
import { ValidationError, ValidationErrorCode } from './types';
import { CustomErrorMessages, getCustomMessage } from './with-message';

/**
 * Mapping of branded type names to error codes and suggestions
 * @internal
 */
const TYPE_ERROR_INFO: Record<
  string,
  { code: ValidationErrorCode; message: string; suggestion: string }
> = {
  Email: {
    code: 'INVALID_EMAIL',
    message: 'Invalid email format',
    suggestion: 'Please provide a valid email address (e.g., user@example.com)',
  },
  UUID: {
    code: 'INVALID_UUID',
    message: 'Invalid UUID format',
    suggestion:
      'Please provide a valid UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)',
  },
  URL: {
    code: 'INVALID_URL',
    message: 'Invalid URL format',
    suggestion: 'Please provide a valid URL starting with http:// or https://',
  },
  Phone: {
    code: 'INVALID_PHONE',
    message: 'Invalid phone number format',
    suggestion: 'Please provide a valid phone number (e.g., +1-234-567-8900)',
  },
  DateString: {
    code: 'INVALID_DATE',
    message: 'Invalid date format',
    suggestion: 'Please provide a date in ISO 8601 format (e.g., 2024-01-15)',
  },
  DateTimeString: {
    code: 'INVALID_DATETIME',
    message: 'Invalid datetime format',
    suggestion:
      'Please provide a datetime in ISO 8601 format (e.g., 2024-01-15T10:30:00Z)',
  },
  IPv4: {
    code: 'INVALID_IPV4',
    message: 'Invalid IPv4 address',
    suggestion: 'Please provide a valid IPv4 address (e.g., 192.168.0.1)',
  },
  IPv6: {
    code: 'INVALID_IPV6',
    message: 'Invalid IPv6 address',
    suggestion:
      'Please provide a valid IPv6 address (e.g., 2001:db8::ff00:42:8329)',
  },
  IP: {
    code: 'INVALID_IP',
    message: 'Invalid IP address',
    suggestion: 'Please provide a valid IPv4 or IPv6 address',
  },
  Integer: {
    code: 'INVALID_INTEGER',
    message: 'Value must be an integer',
    suggestion: 'Please provide a whole number without decimals',
  },
  PositiveNumber: {
    code: 'INVALID_POSITIVE_NUMBER',
    message: 'Value must be a positive number',
    suggestion: 'Please provide a number greater than 0',
  },
  NonNegativeNumber: {
    code: 'INVALID_NON_NEGATIVE_NUMBER',
    message: 'Value must be non-negative',
    suggestion: 'Please provide a number greater than or equal to 0',
  },
  PositiveInteger: {
    code: 'INVALID_POSITIVE_INTEGER',
    message: 'Value must be a positive integer',
    suggestion: 'Please provide a whole number greater than 0',
  },
  Port: {
    code: 'INVALID_PORT',
    message: 'Invalid port number',
    suggestion: 'Please provide a port number between 0 and 65535',
  },
  Percentage: {
    code: 'INVALID_PERCENTAGE',
    message: 'Invalid percentage value',
    suggestion: 'Please provide a number between 0 and 100',
  },
  NonEmptyString: {
    code: 'INVALID_NON_EMPTY_STRING',
    message: 'Value cannot be empty',
    suggestion: 'Please provide a non-empty string',
  },
  TrimmedString: {
    code: 'INVALID_TRIMMED_STRING',
    message: 'Value cannot have leading or trailing whitespace',
    suggestion: 'Please remove leading and trailing spaces',
  },
  LowercaseString: {
    code: 'INVALID_LOWERCASE_STRING',
    message: 'Value must be lowercase',
    suggestion: 'Please provide a lowercase string',
  },
  UppercaseString: {
    code: 'INVALID_UPPERCASE_STRING',
    message: 'Value must be uppercase',
    suggestion: 'Please provide an uppercase string',
  },
  HexColor: {
    code: 'INVALID_HEX_COLOR',
    message: 'Invalid hex color code',
    suggestion: 'Please provide a valid hex color (e.g., #ff0000 or #f00)',
  },
  Slug: {
    code: 'INVALID_SLUG',
    message: 'Invalid slug format',
    suggestion:
      'Please provide a URL-safe slug using lowercase letters, numbers, and hyphens',
  },
  Base64: {
    code: 'INVALID_BASE64',
    message: 'Invalid Base64 encoding',
    suggestion: 'Please provide a valid Base64 encoded string',
  },
  JWT: {
    code: 'INVALID_JWT',
    message: 'Invalid JWT format',
    suggestion: 'Please provide a valid JSON Web Token',
  },
};

/**
 * Gets error information based on the expected type and optional custom messages
 * @internal
 */
function getErrorInfo(
  expected: string,
  actualValue: unknown,
  customMessages?: CustomErrorMessages,
): { code: ValidationErrorCode; message: string; suggestion?: string } {
  const isRequired = actualValue === undefined || actualValue === null;

  // Handle custom messages if provided
  if (customMessages) {
    if (isRequired && customMessages.required) {
      return {
        code: customMessages.code ?? 'REQUIRED',
        message: customMessages.required,
        suggestion: customMessages.suggestion,
      };
    }

    if (!isRequired && customMessages.invalid) {
      const message =
        typeof customMessages.invalid === 'function'
          ? customMessages.invalid(actualValue)
          : customMessages.invalid;

      return {
        code: customMessages.code ?? 'INVALID_FORMAT',
        message,
        suggestion: customMessages.suggestion,
      };
    }
  }

  // Check for branded type
  const typeInfo = TYPE_ERROR_INFO[expected];
  if (typeInfo) {
    return typeInfo;
  }

  // Handle undefined/null (required field)
  if (isRequired) {
    return {
      code: 'REQUIRED',
      message: `Field is required`,
      suggestion: `Please provide a value of type ${expected}`,
    };
  }

  // Generic type mismatch
  const actualType =
    actualValue === null
      ? 'null'
      : actualValue === undefined
        ? 'undefined'
        : Array.isArray(actualValue)
          ? 'array'
          : typeof actualValue;

  return {
    code: 'INVALID_TYPE',
    message: `Expected ${expected} but received ${actualType}`,
    suggestion: `Please provide a valid ${expected}`,
  };
}

/**
 * Checks if a string represents an array index (numeric string)
 * @param key - The key to check
 * @returns true if the key is a numeric string
 */
function isArrayIndex(key: string): boolean {
  return /^\d+$/.test(key);
}

/**
 * Extracts the field path from an io-ts validation error context
 * Formats array indices as `field[index]` instead of `field.index`
 * @param context - The validation error context array
 * @returns The field path with array indices in bracket notation (e.g., "items[0].name")
 */
function getFieldPath(context: t.Context): string {
  const keys = context
    .slice(1) // Skip the root context
    .map((c) => c.key)
    .filter((key) => key !== ''); // Filter empty keys

  if (keys.length === 0) {
    return '';
  }

  let path = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const key = keys[i];
    if (isArrayIndex(key)) {
      path += `[${key}]`;
    } else {
      path += `.${key}`;
    }
  }

  return path;
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
      // Check for custom messages on the codec
      const lastContext = error.context[error.context.length - 1];
      const customMessages = lastContext?.type
        ? getCustomMessage(lastContext.type)
        : undefined;

      const errorInfo = getErrorInfo(expected, actualValue, customMessages);

      errorMap.set(field, {
        field,
        message: errorInfo.message,
        expected,
        value: actualValue,
        code: errorInfo.code,
        suggestion: errorInfo.suggestion,
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
