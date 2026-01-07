/**
 * Codec combinators for common validation patterns
 *
 * @packageDocumentation
 * @module combinators
 * @since 1.2.0
 */

import * as t from 'io-ts';

/**
 * Creates a codec that accepts undefined in addition to the base type
 *
 * @param codec - The base io-ts codec
 * @returns A new codec that accepts `A | undefined`
 *
 * @example
 * ```typescript
 * import { optional } from 'nestjs-io-ts';
 * import * as t from 'io-ts';
 *
 * const UserCodec = t.type({
 *   name: t.string,
 *   nickname: optional(t.string), // string | undefined
 * });
 *
 * // Valid inputs:
 * // { name: "John" }
 * // { name: "John", nickname: undefined }
 * // { name: "John", nickname: "Johnny" }
 * ```
 *
 * @since 1.2.0
 */
export function optional<C extends t.Mixed>(
  codec: C,
): t.UnionC<[C, t.UndefinedC]> {
  return t.union([codec, t.undefined]);
}

/**
 * Creates a codec that accepts null in addition to the base type
 *
 * Useful for database nullable fields where null has semantic meaning.
 *
 * @param codec - The base io-ts codec
 * @returns A new codec that accepts `A | null`
 *
 * @example
 * ```typescript
 * import { nullable } from 'nestjs-io-ts';
 * import * as t from 'io-ts';
 *
 * const UserCodec = t.type({
 *   name: t.string,
 *   deletedAt: nullable(t.string), // string | null
 * });
 *
 * // Valid inputs:
 * // { name: "John", deletedAt: null }
 * // { name: "John", deletedAt: "2024-01-01" }
 * ```
 *
 * @since 1.2.0
 */
export function nullable<C extends t.Mixed>(codec: C): t.UnionC<[C, t.NullC]> {
  return t.union([codec, t.null]);
}

/**
 * Creates a codec that provides a default value when input is undefined
 *
 * The codec accepts the base type or undefined. When undefined is provided,
 * the default value is used instead.
 *
 * @param codec - The base io-ts codec
 * @param defaultValue - The default value to use when input is undefined
 * @returns A new codec that returns the default value for undefined inputs
 *
 * @example
 * ```typescript
 * import { withDefault } from 'nestjs-io-ts';
 * import * as t from 'io-ts';
 *
 * const UserCodec = t.type({
 *   name: t.string,
 *   role: withDefault(t.string, 'user'), // defaults to 'user'
 *   isActive: withDefault(t.boolean, true), // defaults to true
 * });
 *
 * // Input: { name: "John" }
 * // Output: { name: "John", role: "user", isActive: true }
 *
 * // Input: { name: "John", role: "admin" }
 * // Output: { name: "John", role: "admin", isActive: true }
 * ```
 *
 * @since 1.2.0
 */
export function withDefault<C extends t.Mixed>(
  codec: C,
  defaultValue: t.TypeOf<C>,
): t.Type<t.TypeOf<C>, t.OutputOf<C>, unknown> {
  return new t.Type<t.TypeOf<C>, t.OutputOf<C>, unknown>(
    `withDefault(${codec.name}, ${JSON.stringify(defaultValue)})`,
    codec.is,
    (input, context) => {
      if (input === undefined) {
        return t.success(defaultValue);
      }
      return codec.validate(input, context);
    },
    codec.encode,
  );
}

/**
 * Error returned by cross-field validation
 * @since 1.2.0
 */
export interface CrossValidationError {
  /**
   * The field that has the error
   */
  field: string;

  /**
   * Human-readable error message
   */
  message: string;
}

/**
 * Validator function for cross-field validation
 * @since 1.2.0
 */
export type CrossValidator<A> = (data: A) => Array<CrossValidationError>;

/**
 * Creates a codec that performs cross-field validation after the base codec validates
 *
 * Use this for validating relationships between fields, such as:
 * - Password confirmation matching
 * - Date range validation (start date before end date)
 * - Conditional field requirements
 *
 * @param codec - The base io-ts codec
 * @param validator - Function that receives the decoded data and returns validation errors
 * @returns A new codec that includes cross-field validation
 *
 * @example
 * ```typescript
 * import { crossValidate } from 'nestjs-io-ts';
 * import * as t from 'io-ts';
 *
 * // Password confirmation
 * const PasswordResetCodec = crossValidate(
 *   t.type({
 *     password: t.string,
 *     confirmPassword: t.string
 *   }),
 *   (data) => {
 *     if (data.password !== data.confirmPassword) {
 *       return [{ field: 'confirmPassword', message: 'Passwords do not match' }];
 *     }
 *     return [];
 *   }
 * );
 *
 * // Date range validation
 * const DateRangeCodec = crossValidate(
 *   t.type({
 *     startDate: t.string,
 *     endDate: t.string
 *   }),
 *   (data) => {
 *     if (new Date(data.startDate) > new Date(data.endDate)) {
 *       return [{ field: 'endDate', message: 'End date must be after start date' }];
 *     }
 *     return [];
 *   }
 * );
 * ```
 *
 * @since 1.2.0
 */
export function crossValidate<C extends t.Mixed>(
  codec: C,
  validator: CrossValidator<t.TypeOf<C>>,
): t.Type<t.TypeOf<C>, t.OutputOf<C>, unknown> {
  return new t.Type<t.TypeOf<C>, t.OutputOf<C>, unknown>(
    `crossValidate(${codec.name})`,
    codec.is,
    (input, context) => {
      // First, validate with the base codec
      const result = codec.validate(input, context);

      // If base validation fails, return those errors
      if (result._tag === 'Left') {
        return result;
      }

      // Run cross-field validation on the decoded value
      const crossErrors = validator(result.right);

      // If there are cross-validation errors, convert them to io-ts errors
      if (crossErrors.length > 0) {
        return t.failure(
          input,
          context,
          crossErrors.map((e) => `${e.field}: ${e.message}`).join('; '),
        );
      }

      return result;
    },
    codec.encode,
  );
}

/**
 * Transformer function type
 * @since 1.2.0
 */
export type Transformer<A, B> = (value: A) => B;

/**
 * Creates a codec that transforms the decoded value
 *
 * The transform is applied after successful validation. Use this for:
 * - Trimming whitespace from strings
 * - Normalizing email addresses to lowercase
 * - Parsing date strings to Date objects
 * - Any post-validation transformations
 *
 * @param codec - The base io-ts codec
 * @param transformer - Function to transform the decoded value
 * @returns A new codec that transforms values after decoding
 *
 * @example
 * ```typescript
 * import { transform } from 'nestjs-io-ts';
 * import * as t from 'io-ts';
 *
 * // Trim whitespace
 * const TrimmedString = transform(t.string, (s) => s.trim());
 *
 * // Normalize email to lowercase
 * const NormalizedEmail = transform(Email, (s) => s.toLowerCase());
 *
 * // Parse to Date object
 * const ParsedDate = transform(DateString, (s) => new Date(s));
 *
 * // Use in codec
 * const UserCodec = t.type({
 *   name: transform(t.string, (s) => s.trim()),
 *   email: transform(t.string, (s) => s.toLowerCase().trim()),
 * });
 *
 * // Input: { name: "  John  ", email: "  USER@EXAMPLE.COM  " }
 * // Output: { name: "John", email: "user@example.com" }
 * ```
 *
 * @since 1.2.0
 */
export function transform<C extends t.Mixed, B>(
  codec: C,
  transformer: Transformer<t.TypeOf<C>, B>,
): t.Type<B, t.OutputOf<C>, unknown> {
  return new t.Type<B, t.OutputOf<C>, unknown>(
    `transform(${codec.name})`,
    (input): input is B => {
      // For type guard, we check if decoding succeeds
      // Since B may be different from TypeOf<C>, we need to be careful
      if (!codec.is(input)) {
        // Try to see if it's already a transformed value by checking if the base can validate
        // This is tricky - for simplicity, we check if codec can validate
        return false;
      }
      return true;
    },
    (input, context) => {
      // First, validate with the base codec
      const result = codec.validate(input, context);

      // If validation fails, return the error
      if (result._tag === 'Left') {
        return result;
      }

      // Transform the value
      try {
        const transformed = transformer(result.right);
        return t.success(transformed);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Transform failed';
        return t.failure(input, context, message);
      }
    },
    // Encoding: we need to reverse the transform, but since that's not always possible,
    // we'll use the base codec's encode. Users needing bidirectional transforms
    // should use io-ts's built-in codec patterns
    (value) => codec.encode(value as unknown as t.TypeOf<C>),
  );
}
