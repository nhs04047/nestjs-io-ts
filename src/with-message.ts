import * as t from 'io-ts';

import { ValidationErrorCode } from './types';

/**
 * Custom error message configuration
 * @since 1.1.0
 */
export interface CustomErrorMessages {
  /**
   * Message to show when validation fails (type mismatch or format error)
   */
  invalid?: string | ((value: unknown) => string);

  /**
   * Message to show when value is undefined/null but required
   */
  required?: string;

  /**
   * Custom error code to use instead of the default
   */
  code?: ValidationErrorCode;

  /**
   * Custom suggestion for fixing the error
   */
  suggestion?: string;
}

/**
 * Symbol to mark codecs that have custom error messages
 * @internal
 */
export const CUSTOM_MESSAGE_SYMBOL = Symbol.for('nestjs-io-ts:custom-message');

/**
 * Extended codec type with custom error messages
 * @internal
 */
export interface CodecWithMessage<A, O, I> extends t.Type<A, O, I> {
  [CUSTOM_MESSAGE_SYMBOL]?: CustomErrorMessages;
}

/**
 * Wraps an io-ts codec with custom error messages
 *
 * @param codec - The io-ts codec to wrap
 * @param messages - Custom error messages configuration or a simple error message function
 * @returns A new codec with the same validation behavior but custom error messages
 *
 * @example
 * ```typescript
 * import { withMessage, Email } from 'nestjs-io-ts';
 * import * as t from 'io-ts';
 *
 * const UserCodec = t.type({
 *   // Simple string message
 *   email: withMessage(Email, {
 *     invalid: 'Please enter a valid email address',
 *     required: 'Email is required'
 *   }),
 *
 *   // Function-based message with access to the invalid value
 *   age: withMessage(t.number, {
 *     invalid: (value) => `Age must be a number, got ${typeof value}`,
 *     required: 'Age is required'
 *   }),
 *
 *   // With custom code and suggestion
 *   username: withMessage(t.string, {
 *     invalid: 'Invalid username',
 *     code: 'INVALID_FORMAT',
 *     suggestion: 'Username must be alphanumeric'
 *   })
 * });
 * ```
 *
 * @since 1.1.0
 */
export function withMessage<A, O, I>(
  codec: t.Type<A, O, I>,
  messages: CustomErrorMessages | ((value: unknown) => string),
): CodecWithMessage<A, O, I> {
  const normalizedMessages: CustomErrorMessages =
    typeof messages === 'function' ? { invalid: messages } : messages;

  // Create a new codec that wraps the original
  const wrappedCodec = new t.Type<A, O, I>(
    codec.name,
    codec.is,
    codec.validate,
    codec.encode,
  ) as CodecWithMessage<A, O, I>;

  // Attach custom messages
  wrappedCodec[CUSTOM_MESSAGE_SYMBOL] = normalizedMessages;

  return wrappedCodec;
}

/**
 * Checks if a codec has custom error messages
 * @internal
 */
export function hasCustomMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  codec: t.Type<any, any, any> | t.Decoder<any, any>,
): codec is CodecWithMessage<unknown, unknown, unknown> {
  return CUSTOM_MESSAGE_SYMBOL in codec;
}

/**
 * Gets custom error messages from a codec if available
 * @internal
 */
export function getCustomMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  codec: t.Type<any, any, any> | t.Decoder<any, any>,
): CustomErrorMessages | undefined {
  if (hasCustomMessage(codec)) {
    return codec[CUSTOM_MESSAGE_SYMBOL];
  }
  return undefined;
}
