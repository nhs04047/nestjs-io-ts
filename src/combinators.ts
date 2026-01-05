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
