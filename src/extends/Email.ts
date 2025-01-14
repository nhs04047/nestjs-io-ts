import * as t from 'io-ts';

/**
 * @since 0.0.5
 */
export interface EmailBrand {
  readonly Email: unique symbol;
}

/**
 * @since 0.0.5
 */
export type Email = t.Branded<string, EmailBrand>;

/**
 * @since 0.0.5
 */
export interface EmailC extends t.Type<Email, string, unknown> {}

/**
 * @since 0.0.5
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const Email: EmailC = t.brand(
  t.string,
  (s): s is Email => emailRegex.test(s),
  'Email',
);
