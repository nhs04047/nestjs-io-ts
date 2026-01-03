import * as t from 'io-ts';

// ============================================================================
// DateString (YYYY-MM-DD format)
// ============================================================================

/**
 * Brand interface for DateString type
 * @since 1.0.0
 */
export interface DateStringBrand {
  readonly DateString: unique symbol;
}

/**
 * Branded DateString type - a string in YYYY-MM-DD format
 *
 * @example
 * ```typescript
 * import { DateString } from 'nestjs-io-ts';
 *
 * const EventCodec = t.type({
 *   date: DateString,
 * });
 *
 * // Valid
 * EventCodec.decode({ date: '2024-01-15' }); // Right
 *
 * // Invalid
 * EventCodec.decode({ date: '01-15-2024' }); // Left
 * ```
 *
 * @since 1.0.0
 */
export type DateString = t.Branded<string, DateStringBrand>;

/**
 * Type codec interface for DateString
 * @since 1.0.0
 */
export interface DateStringC extends t.Type<DateString, string, unknown> {}

/**
 * DateString regex pattern - YYYY-MM-DD format
 * @internal
 */
const DATE_STRING_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param s - The string to validate
 * @returns True if the string is a valid date
 * @internal
 */
function isValidDateString(s: string): boolean {
  if (!DATE_STRING_REGEX.test(s)) return false;

  // Validate actual date (e.g., not 2024-02-30)
  const date = new Date(s);
  if (isNaN(date.getTime())) return false;

  // Ensure the parsed date matches the input
  const [year, month, day] = s.split('-').map(Number);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

/**
 * io-ts codec for validating date strings in YYYY-MM-DD format
 *
 * Validates strings as dates in ISO 8601 date format.
 * Also validates that the date is actually valid (e.g., rejects 2024-02-30).
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { DateString } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * // Valid dates
 * isRight(DateString.decode('2024-01-15')); // true
 * isRight(DateString.decode('2024-02-29')); // true (leap year)
 *
 * // Invalid
 * isRight(DateString.decode('2024-02-30')); // false (invalid date)
 * isRight(DateString.decode('01-15-2024')); // false (wrong format)
 * ```
 *
 * @since 1.0.0
 */
export const DateString: DateStringC = t.brand(
  t.string,
  (s): s is DateString => isValidDateString(s),
  'DateString',
);

// ============================================================================
// DateTimeString (ISO 8601 datetime format)
// ============================================================================

/**
 * Brand interface for DateTimeString type
 * @since 1.0.0
 */
export interface DateTimeStringBrand {
  readonly DateTimeString: unique symbol;
}

/**
 * Branded DateTimeString type - a string in ISO 8601 datetime format
 *
 * @example
 * ```typescript
 * import { DateTimeString } from 'nestjs-io-ts';
 *
 * const EventCodec = t.type({
 *   createdAt: DateTimeString,
 * });
 *
 * // Valid
 * EventCodec.decode({ createdAt: '2024-01-15T10:30:00Z' }); // Right
 *
 * // Invalid
 * EventCodec.decode({ createdAt: '2024-01-15' }); // Left
 * ```
 *
 * @since 1.0.0
 */
export type DateTimeString = t.Branded<string, DateTimeStringBrand>;

/**
 * Type codec interface for DateTimeString
 * @since 1.0.0
 */
export interface DateTimeStringC
  extends t.Type<DateTimeString, string, unknown> {}

/**
 * Validates if a string is a valid ISO 8601 datetime
 * @param s - The string to validate
 * @returns True if the string is a valid datetime
 * @internal
 */
function isValidDateTimeString(s: string): boolean {
  const date = new Date(s);
  if (isNaN(date.getTime())) return false;

  // Must have time component (T separator)
  return s.includes('T');
}

/**
 * io-ts codec for validating datetime strings in ISO 8601 format
 *
 * Validates strings as datetimes in ISO 8601 format.
 * Accepts various timezone formats (Z, +HH:MM, -HH:MM).
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { DateTimeString } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * // Valid datetimes
 * isRight(DateTimeString.decode('2024-01-15T10:30:00Z')); // true
 * isRight(DateTimeString.decode('2024-01-15T10:30:00.000Z')); // true
 * isRight(DateTimeString.decode('2024-01-15T10:30:00+09:00')); // true
 *
 * // Invalid
 * isRight(DateTimeString.decode('2024-01-15')); // false (no time)
 * isRight(DateTimeString.decode('not-a-date')); // false
 * ```
 *
 * @since 1.0.0
 */
export const DateTimeString: DateTimeStringC = t.brand(
  t.string,
  (s): s is DateTimeString => isValidDateTimeString(s),
  'DateTimeString',
);
