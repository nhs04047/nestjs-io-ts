import * as t from 'io-ts';

/**
 * Brand interface for Phone type
 * @since 1.0.0
 */
export interface PhoneBrand {
  readonly Phone: unique symbol;
}

/**
 * Branded Phone type - a string that has been validated as a valid phone number
 *
 * Supports international format with optional country code
 *
 * @example
 * ```typescript
 * import { Phone } from 'nestjs-io-ts';
 *
 * const ContactCodec = t.type({
 *   phone: Phone,
 * });
 *
 * // Valid
 * ContactCodec.decode({ phone: '+1-234-567-8900' }); // Right
 * ContactCodec.decode({ phone: '+821012345678' }); // Right
 *
 * // Invalid
 * ContactCodec.decode({ phone: 'abc' }); // Left
 * ```
 *
 * @since 1.0.0
 */
export type Phone = t.Branded<string, PhoneBrand>;

/**
 * Type codec interface for Phone
 * @since 1.0.0
 */
export interface PhoneC extends t.Type<Phone, string, unknown> {}

/**
 * Phone number regex pattern
 * Supports:
 * - International format: +1-234-567-8900, +82 10 1234 5678
 * - With or without country code
 * - Various separators: spaces, hyphens, dots, parentheses
 * - Minimum 7 digits, maximum 15 (E.164 standard)
 * @internal
 */
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

/**
 * Validates if a string is a valid phone number
 * @param s - The string to validate
 * @returns True if the string is a valid phone number
 * @internal
 */
function isValidPhone(s: string): boolean {
  if (!PHONE_REGEX.test(s)) return false;

  // Count actual digits
  const digitCount = (s.match(/\d/g) || []).length;

  // E.164 standard: 7-15 digits
  return digitCount >= 7 && digitCount <= 15;
}

/**
 * io-ts codec for validating phone numbers
 *
 * Validates strings as phone numbers in international format.
 * Supports various formats with country codes, extensions, and separators.
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { Phone } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * // Valid phone numbers
 * isRight(Phone.decode('+1-234-567-8900')); // true
 * isRight(Phone.decode('+82 10 1234 5678')); // true
 * isRight(Phone.decode('(555) 123-4567')); // true
 *
 * // Invalid
 * isRight(Phone.decode('abc')); // false
 * isRight(Phone.decode('123')); // false (too short)
 * ```
 *
 * @since 1.0.0
 */
export const Phone: PhoneC = t.brand(
  t.string,
  (s): s is Phone => isValidPhone(s),
  'Phone',
);
