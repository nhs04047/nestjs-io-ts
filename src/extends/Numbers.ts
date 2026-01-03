import * as t from 'io-ts';

// ============================================================================
// Integer
// ============================================================================

/**
 * Brand interface for Integer type
 * @since 1.0.0
 */
export interface IntegerBrand {
  readonly Integer: unique symbol;
}

/**
 * Branded Integer type - a number that has been validated as an integer
 *
 * @example
 * ```typescript
 * import { Integer } from 'nestjs-io-ts';
 *
 * const ItemCodec = t.type({
 *   quantity: Integer,
 * });
 *
 * // Valid
 * ItemCodec.decode({ quantity: 5 }); // Right
 *
 * // Invalid
 * ItemCodec.decode({ quantity: 5.5 }); // Left
 * ```
 *
 * @since 1.0.0
 */
export type Integer = t.Branded<number, IntegerBrand>;

/**
 * Type codec interface for Integer
 * @since 1.0.0
 */
export interface IntegerC extends t.Type<Integer, number, unknown> {}

/**
 * io-ts codec for validating integers
 *
 * @example
 * ```typescript
 * import { Integer } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(Integer.decode(5)); // true
 * isRight(Integer.decode(-10)); // true
 * isRight(Integer.decode(5.5)); // false
 * ```
 *
 * @since 1.0.0
 */
export const Integer: IntegerC = t.brand(
  t.number,
  (n): n is Integer => Number.isInteger(n),
  'Integer',
);

// ============================================================================
// PositiveNumber
// ============================================================================

/**
 * Brand interface for PositiveNumber type
 * @since 1.0.0
 */
export interface PositiveNumberBrand {
  readonly PositiveNumber: unique symbol;
}

/**
 * Branded PositiveNumber type - a number greater than 0
 *
 * @since 1.0.0
 */
export type PositiveNumber = t.Branded<number, PositiveNumberBrand>;

/**
 * Type codec interface for PositiveNumber
 * @since 1.0.0
 */
export interface PositiveNumberC
  extends t.Type<PositiveNumber, number, unknown> {}

/**
 * io-ts codec for validating positive numbers (> 0)
 *
 * @example
 * ```typescript
 * import { PositiveNumber } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(PositiveNumber.decode(5)); // true
 * isRight(PositiveNumber.decode(0.1)); // true
 * isRight(PositiveNumber.decode(0)); // false
 * isRight(PositiveNumber.decode(-5)); // false
 * ```
 *
 * @since 1.0.0
 */
export const PositiveNumber: PositiveNumberC = t.brand(
  t.number,
  (n): n is PositiveNumber => n > 0,
  'PositiveNumber',
);

// ============================================================================
// NonNegativeNumber
// ============================================================================

/**
 * Brand interface for NonNegativeNumber type
 * @since 1.0.0
 */
export interface NonNegativeNumberBrand {
  readonly NonNegativeNumber: unique symbol;
}

/**
 * Branded NonNegativeNumber type - a number greater than or equal to 0
 *
 * @since 1.0.0
 */
export type NonNegativeNumber = t.Branded<number, NonNegativeNumberBrand>;

/**
 * Type codec interface for NonNegativeNumber
 * @since 1.0.0
 */
export interface NonNegativeNumberC
  extends t.Type<NonNegativeNumber, number, unknown> {}

/**
 * io-ts codec for validating non-negative numbers (>= 0)
 *
 * @example
 * ```typescript
 * import { NonNegativeNumber } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(NonNegativeNumber.decode(5)); // true
 * isRight(NonNegativeNumber.decode(0)); // true
 * isRight(NonNegativeNumber.decode(-5)); // false
 * ```
 *
 * @since 1.0.0
 */
export const NonNegativeNumber: NonNegativeNumberC = t.brand(
  t.number,
  (n): n is NonNegativeNumber => n >= 0,
  'NonNegativeNumber',
);

// ============================================================================
// PositiveInteger
// ============================================================================

/**
 * Brand interface for PositiveInteger type
 * @since 1.0.0
 */
export interface PositiveIntegerBrand {
  readonly PositiveInteger: unique symbol;
}

/**
 * Branded PositiveInteger type - an integer greater than 0
 *
 * @since 1.0.0
 */
export type PositiveInteger = t.Branded<number, PositiveIntegerBrand>;

/**
 * Type codec interface for PositiveInteger
 * @since 1.0.0
 */
export interface PositiveIntegerC
  extends t.Type<PositiveInteger, number, unknown> {}

/**
 * io-ts codec for validating positive integers (> 0)
 *
 * @example
 * ```typescript
 * import { PositiveInteger } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(PositiveInteger.decode(5)); // true
 * isRight(PositiveInteger.decode(1)); // true
 * isRight(PositiveInteger.decode(0)); // false
 * isRight(PositiveInteger.decode(5.5)); // false
 * ```
 *
 * @since 1.0.0
 */
export const PositiveInteger: PositiveIntegerC = t.brand(
  t.number,
  (n): n is PositiveInteger => Number.isInteger(n) && n > 0,
  'PositiveInteger',
);

// ============================================================================
// Port
// ============================================================================

/**
 * Brand interface for Port type
 * @since 1.0.0
 */
export interface PortBrand {
  readonly Port: unique symbol;
}

/**
 * Branded Port type - a valid network port number (0-65535)
 *
 * @since 1.0.0
 */
export type Port = t.Branded<number, PortBrand>;

/**
 * Type codec interface for Port
 * @since 1.0.0
 */
export interface PortC extends t.Type<Port, number, unknown> {}

/**
 * io-ts codec for validating network port numbers
 *
 * @example
 * ```typescript
 * import { Port } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(Port.decode(80)); // true
 * isRight(Port.decode(3000)); // true
 * isRight(Port.decode(65535)); // true
 * isRight(Port.decode(-1)); // false
 * isRight(Port.decode(65536)); // false
 * ```
 *
 * @since 1.0.0
 */
export const Port: PortC = t.brand(
  t.number,
  (n): n is Port => Number.isInteger(n) && n >= 0 && n <= 65535,
  'Port',
);

// ============================================================================
// Percentage
// ============================================================================

/**
 * Brand interface for Percentage type
 * @since 1.0.0
 */
export interface PercentageBrand {
  readonly Percentage: unique symbol;
}

/**
 * Branded Percentage type - a number between 0 and 100 (inclusive)
 *
 * @since 1.0.0
 */
export type Percentage = t.Branded<number, PercentageBrand>;

/**
 * Type codec interface for Percentage
 * @since 1.0.0
 */
export interface PercentageC extends t.Type<Percentage, number, unknown> {}

/**
 * io-ts codec for validating percentage values (0-100)
 *
 * @example
 * ```typescript
 * import { Percentage } from 'nestjs-io-ts';
 * import { isRight } from 'fp-ts/Either';
 *
 * isRight(Percentage.decode(50)); // true
 * isRight(Percentage.decode(0)); // true
 * isRight(Percentage.decode(100)); // true
 * isRight(Percentage.decode(-1)); // false
 * isRight(Percentage.decode(101)); // false
 * ```
 *
 * @since 1.0.0
 */
export const Percentage: PercentageC = t.brand(
  t.number,
  (n): n is Percentage => n >= 0 && n <= 100,
  'Percentage',
);
