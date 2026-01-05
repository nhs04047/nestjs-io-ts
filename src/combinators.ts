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
