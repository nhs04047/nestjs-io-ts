import * as t from 'io-ts';

/**
 * Brand interface for URL type
 * @since 1.0.0
 */
export interface URLBrand {
  readonly URL: unique symbol;
}

/**
 * Branded URL type - a string that has been validated as a valid URL
 *
 * @example
 * ```typescript
 * import { URL } from 'nestjs-io-ts';
 *
 * const LinkCodec = t.type({
 *   href: URL,
 * });
 *
 * // Valid
 * LinkCodec.decode({ href: 'https://example.com/path' }); // Right
 *
 * // Invalid
 * LinkCodec.decode({ href: 'not-a-url' }); // Left
 * ```
 *
 * @since 1.0.0
 */
export type URLString = t.Branded<string, URLBrand>;

/**
 * Type codec interface for URL
 * @since 1.0.0
 */
export interface URLC extends t.Type<URLString, string, unknown> {}

/**
 * Validates if a string is a valid URL
 * Uses the native URL constructor for validation
 * @param s - The string to validate
 * @returns True if the string is a valid URL
 * @internal
 */
function isValidURL(s: string): boolean {
  try {
    const url = new globalThis.URL(s);
    // Only allow http and https protocols
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * io-ts codec for validating URL strings
 *
 * Validates strings as valid URLs using the native URL constructor.
 * Only accepts http:// and https:// protocols.
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { URL } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * // Valid URLs
 * isRight(URL.decode('https://example.com')); // true
 * isRight(URL.decode('http://localhost:3000/api')); // true
 *
 * // Invalid
 * isRight(URL.decode('ftp://example.com')); // false (only http/https)
 * isRight(URL.decode('not-a-url')); // false
 * ```
 *
 * @since 1.0.0
 */
export const URL: URLC = t.brand(
  t.string,
  (s): s is URLString => isValidURL(s),
  'URL',
);
