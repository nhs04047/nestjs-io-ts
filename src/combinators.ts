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
