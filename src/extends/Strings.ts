import * as t from 'io-ts';

// ============================================================================
// NonEmptyString
// ============================================================================

/**
 * Brand interface for NonEmptyString type
 * @since 1.0.0
 */
export interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol;
}

/**
 * Branded NonEmptyString type - a string with at least one character
 *
 * @since 1.0.0
 */
export type NonEmptyString = t.Branded<string, NonEmptyStringBrand>;

/**
 * Type codec interface for NonEmptyString
 * @since 1.0.0
 */
export interface NonEmptyStringC
  extends t.Type<NonEmptyString, string, unknown> {}

/**
 * io-ts codec for validating non-empty strings
 *
 * @example
 * ```typescript
 * import { NonEmptyString } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(NonEmptyString.decode('hello')); // true
 * isRight(NonEmptyString.decode('')); // false
 * ```
 *
 * @since 1.0.0
 */
export const NonEmptyString: NonEmptyStringC = t.brand(
  t.string,
  (s): s is NonEmptyString => s.length > 0,
  'NonEmptyString',
);

// ============================================================================
// TrimmedString
// ============================================================================

/**
 * Brand interface for TrimmedString type
 * @since 1.0.0
 */
export interface TrimmedStringBrand {
  readonly TrimmedString: unique symbol;
}

/**
 * Branded TrimmedString type - a string with no leading or trailing whitespace
 *
 * @since 1.0.0
 */
export type TrimmedString = t.Branded<string, TrimmedStringBrand>;

/**
 * Type codec interface for TrimmedString
 * @since 1.0.0
 */
export interface TrimmedStringC
  extends t.Type<TrimmedString, string, unknown> {}

/**
 * io-ts codec for validating trimmed strings (no leading/trailing whitespace)
 *
 * @example
 * ```typescript
 * import { TrimmedString } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(TrimmedString.decode('hello')); // true
 * isRight(TrimmedString.decode(' hello')); // false
 * isRight(TrimmedString.decode('hello ')); // false
 * ```
 *
 * @since 1.0.0
 */
export const TrimmedString: TrimmedStringC = t.brand(
  t.string,
  (s): s is TrimmedString => s === s.trim(),
  'TrimmedString',
);

// ============================================================================
// LowercaseString
// ============================================================================

/**
 * Brand interface for LowercaseString type
 * @since 1.0.0
 */
export interface LowercaseStringBrand {
  readonly LowercaseString: unique symbol;
}

/**
 * Branded LowercaseString type - a string that is all lowercase
 *
 * @since 1.0.0
 */
export type LowercaseString = t.Branded<string, LowercaseStringBrand>;

/**
 * Type codec interface for LowercaseString
 * @since 1.0.0
 */
export interface LowercaseStringC
  extends t.Type<LowercaseString, string, unknown> {}

/**
 * io-ts codec for validating lowercase strings
 *
 * @example
 * ```typescript
 * import { LowercaseString } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(LowercaseString.decode('hello')); // true
 * isRight(LowercaseString.decode('Hello')); // false
 * ```
 *
 * @since 1.0.0
 */
export const LowercaseString: LowercaseStringC = t.brand(
  t.string,
  (s): s is LowercaseString => s === s.toLowerCase(),
  'LowercaseString',
);

// ============================================================================
// UppercaseString
// ============================================================================

/**
 * Brand interface for UppercaseString type
 * @since 1.0.0
 */
export interface UppercaseStringBrand {
  readonly UppercaseString: unique symbol;
}

/**
 * Branded UppercaseString type - a string that is all uppercase
 *
 * @since 1.0.0
 */
export type UppercaseString = t.Branded<string, UppercaseStringBrand>;

/**
 * Type codec interface for UppercaseString
 * @since 1.0.0
 */
export interface UppercaseStringC
  extends t.Type<UppercaseString, string, unknown> {}

/**
 * io-ts codec for validating uppercase strings
 *
 * @example
 * ```typescript
 * import { UppercaseString } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(UppercaseString.decode('HELLO')); // true
 * isRight(UppercaseString.decode('Hello')); // false
 * ```
 *
 * @since 1.0.0
 */
export const UppercaseString: UppercaseStringC = t.brand(
  t.string,
  (s): s is UppercaseString => s === s.toUpperCase(),
  'UppercaseString',
);

// ============================================================================
// HexColor
// ============================================================================

/**
 * Brand interface for HexColor type
 * @since 1.0.0
 */
export interface HexColorBrand {
  readonly HexColor: unique symbol;
}

/**
 * Branded HexColor type - a string representing a hex color code
 *
 * @since 1.0.0
 */
export type HexColor = t.Branded<string, HexColorBrand>;

/**
 * Type codec interface for HexColor
 * @since 1.0.0
 */
export interface HexColorC extends t.Type<HexColor, string, unknown> {}

/**
 * Hex color regex - matches #RGB, #RRGGBB, #RGBA, #RRGGBBAA
 * @internal
 */
const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * io-ts codec for validating hex color codes
 *
 * Supports:
 * - 3-digit hex: #RGB
 * - 4-digit hex with alpha: #RGBA
 * - 6-digit hex: #RRGGBB
 * - 8-digit hex with alpha: #RRGGBBAA
 *
 * @example
 * ```typescript
 * import { HexColor } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(HexColor.decode('#fff')); // true
 * isRight(HexColor.decode('#ffffff')); // true
 * isRight(HexColor.decode('#ff0000aa')); // true
 * isRight(HexColor.decode('fff')); // false (missing #)
 * ```
 *
 * @since 1.0.0
 */
export const HexColor: HexColorC = t.brand(
  t.string,
  (s): s is HexColor => HEX_COLOR_REGEX.test(s),
  'HexColor',
);

// ============================================================================
// Slug
// ============================================================================

/**
 * Brand interface for Slug type
 * @since 1.0.0
 */
export interface SlugBrand {
  readonly Slug: unique symbol;
}

/**
 * Branded Slug type - a URL-friendly string (lowercase, hyphens, no spaces)
 *
 * @since 1.0.0
 */
export type Slug = t.Branded<string, SlugBrand>;

/**
 * Type codec interface for Slug
 * @since 1.0.0
 */
export interface SlugC extends t.Type<Slug, string, unknown> {}

/**
 * Slug regex - lowercase letters, numbers, and hyphens
 * @internal
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * io-ts codec for validating URL slugs
 *
 * A valid slug:
 * - Contains only lowercase letters, numbers, and hyphens
 * - Cannot start or end with a hyphen
 * - Cannot have consecutive hyphens
 *
 * @example
 * ```typescript
 * import { Slug } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(Slug.decode('hello-world')); // true
 * isRight(Slug.decode('my-blog-post-123')); // true
 * isRight(Slug.decode('Hello World')); // false
 * isRight(Slug.decode('-invalid')); // false
 * ```
 *
 * @since 1.0.0
 */
export const Slug: SlugC = t.brand(
  t.string,
  (s): s is Slug => SLUG_REGEX.test(s),
  'Slug',
);

// ============================================================================
// Base64
// ============================================================================

/**
 * Brand interface for Base64 type
 * @since 1.0.0
 */
export interface Base64Brand {
  readonly Base64: unique symbol;
}

/**
 * Branded Base64 type - a valid base64 encoded string
 *
 * @since 1.0.0
 */
export type Base64 = t.Branded<string, Base64Brand>;

/**
 * Type codec interface for Base64
 * @since 1.0.0
 */
export interface Base64C extends t.Type<Base64, string, unknown> {}

/**
 * Base64 regex - validates base64 format
 * @internal
 */
const BASE64_REGEX =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * io-ts codec for validating base64 encoded strings
 *
 * @example
 * ```typescript
 * import { Base64 } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(Base64.decode('SGVsbG8gV29ybGQ=')); // true
 * isRight(Base64.decode('not-base64!')); // false
 * ```
 *
 * @since 1.0.0
 */
export const Base64: Base64C = t.brand(
  t.string,
  (s): s is Base64 => BASE64_REGEX.test(s),
  'Base64',
);

// ============================================================================
// JWT
// ============================================================================

/**
 * Brand interface for JWT type
 * @since 1.0.0
 */
export interface JWTBrand {
  readonly JWT: unique symbol;
}

/**
 * Branded JWT type - a valid JSON Web Token format string
 *
 * @since 1.0.0
 */
export type JWT = t.Branded<string, JWTBrand>;

/**
 * Type codec interface for JWT
 * @since 1.0.0
 */
export interface JWTC extends t.Type<JWT, string, unknown> {}

/**
 * JWT regex - validates JWT format (three base64url parts separated by dots)
 * @internal
 */
const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

/**
 * io-ts codec for validating JWT format strings
 *
 * Note: This only validates the format, not the signature or claims.
 *
 * @example
 * ```typescript
 * import { JWT } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(JWT.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')); // true
 * isRight(JWT.decode('not.a.valid.jwt')); // false
 * ```
 *
 * @since 1.0.0
 */
export const JWT: JWTC = t.brand(
  t.string,
  (s): s is JWT => JWT_REGEX.test(s),
  'JWT',
);
