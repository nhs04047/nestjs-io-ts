import * as t from 'io-ts';

/**
 * Brand interface for UUID type
 * @since 1.0.0
 */
export interface UUIDBrand {
  readonly UUID: unique symbol;
}

/**
 * Branded UUID type - a string that has been validated as a valid UUID
 *
 * Supports UUID versions 1-5 in standard format (8-4-4-4-12 hex digits)
 *
 * @example
 * ```typescript
 * import { UUID } from 'nestjs-io-ts';
 *
 * const ResourceCodec = t.type({
 *   id: UUID,
 * });
 *
 * // Valid
 * ResourceCodec.decode({ id: '123e4567-e89b-12d3-a456-426614174000' }); // Right
 *
 * // Invalid
 * ResourceCodec.decode({ id: 'not-a-uuid' }); // Left
 * ```
 *
 * @since 1.0.0
 */
export type UUID = t.Branded<string, UUIDBrand>;

/**
 * Type codec interface for UUID
 * @since 1.0.0
 */
export interface UUIDC extends t.Type<UUID, string, unknown> {}

/**
 * UUID regex pattern - validates UUID v1-v5
 * Format: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
 * Where M is version (1-5) and N is variant (8, 9, a, b)
 * @internal
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * io-ts codec for validating UUID strings
 *
 * Validates strings as UUIDs (Universally Unique Identifiers) in the standard
 * 8-4-4-4-12 hexadecimal format. Supports versions 1 through 5.
 *
 * @example
 * ```typescript
 * import * as t from 'io-ts';
 * import { UUID } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * // Standalone validation
 * isRight(UUID.decode('123e4567-e89b-12d3-a456-426614174000')); // true
 * isRight(UUID.decode('not-a-uuid')); // false
 *
 * // In a codec
 * const EntityCodec = t.type({
 *   id: UUID,
 *   name: t.string,
 * });
 * ```
 *
 * @since 1.0.0
 */
export const UUID: UUIDC = t.brand(
  t.string,
  (s): s is UUID => UUID_REGEX.test(s),
  'UUID',
);
