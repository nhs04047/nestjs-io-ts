import * as t from 'io-ts';

/**
 * Brand interface for Email type
 * @since 0.0.5
 */
export interface EmailBrand {
  readonly Email: unique symbol;
}

/**
 * Branded Email type - a string that has been validated as a valid email address
 *
 * @example
 * ```typescript
 * import { Email } from 'nestjs-io-ts';
 *
 * const UserCodec = t.type({
 *   email: Email,
 * });
 *
 * // Valid
 * UserCodec.decode({ email: 'user@example.com' }); // Right
 *
 * // Invalid
 * UserCodec.decode({ email: 'invalid-email' }); // Left
 * ```
 *
 * @since 0.0.5
 */
export type Email = t.Branded<string, EmailBrand>;

/**
 * Type codec interface for Email
 * @since 0.0.5
 */
export interface EmailC extends t.Type<Email, string, unknown> {}

/**
 * Email validation regex based on a practical subset of RFC 5322
 *
 * This regex validates most common email formats:
 * - Standard emails: user@example.com
 * - Subdomains: user@mail.example.com
 * - Plus addressing: user+tag@example.com
 * - Dots in local part: first.last@example.com
 * - Numbers: user123@example.com
 * - Hyphens in domain: user@my-domain.com
 *
 * Known limitations (intentionally not supported for security/simplicity):
 * - Quoted local parts: "user name"@example.com
 * - IP address domains: user@[192.168.1.1]
 * - Comments: user(comment)@example.com
 * - International characters (IDN) in domain
 *
 * @internal
 */
const EMAIL_REGEX =
  /^(?!.*\.\.)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-](?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-])?@([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,})$/;

/**
 * Validates if a string is a valid email address
 * @param s - The string to validate
 * @returns True if the string is a valid email address
 * @internal
 */
function isValidEmail(s: string): boolean {
  // Quick length check (RFC 5321 limits)
  if (s.length > 254) return false;

  const atIndex = s.indexOf('@');
  if (atIndex === -1) return false;

  const localPart = s.slice(0, atIndex);
  const domainPart = s.slice(atIndex + 1);

  // Local part max length is 64 (RFC 5321)
  if (localPart.length > 64) return false;

  // Domain part max length is 255 (RFC 5321)
  if (domainPart.length > 255) return false;

  return EMAIL_REGEX.test(s);
}

/**
 * io-ts codec for validating email addresses
 *
 * Validates strings as email addresses following a practical subset of RFC 5322.
 * Provides runtime type checking with TypeScript type inference.
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { Email } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * // Standalone validation
 * isRight(Email.decode('user@example.com')); // true
 * isRight(Email.decode('invalid')); // false
 *
 * // In a codec
 * const UserCodec = t.type({
 *   name: t.string,
 *   email: Email,
 * });
 *
 * type User = t.TypeOf<typeof UserCodec>;
 * // { name: string; email: Email }
 * ```
 *
 * @since 0.0.5
 */
export const Email: EmailC = t.brand(
  t.string,
  (s): s is Email => isValidEmail(s),
  'Email',
);
