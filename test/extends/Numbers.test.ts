import { isLeft, isRight } from 'fp-ts/Either';

import {
  Integer,
  NonNegativeNumber,
  Percentage,
  Port,
  PositiveInteger,
  PositiveNumber,
} from '../../src/extends';

describe('Integer', () => {
  it('should accept integers', () => {
    expect(isRight(Integer.decode(0))).toBe(true);
    expect(isRight(Integer.decode(1))).toBe(true);
    expect(isRight(Integer.decode(-1))).toBe(true);
    expect(isRight(Integer.decode(100))).toBe(true);
    expect(isRight(Integer.decode(-100))).toBe(true);
    expect(isRight(Integer.decode(Number.MAX_SAFE_INTEGER))).toBe(true);
    expect(isRight(Integer.decode(Number.MIN_SAFE_INTEGER))).toBe(true);
  });

  it('should reject non-integers', () => {
    expect(isLeft(Integer.decode(1.5))).toBe(true);
    expect(isLeft(Integer.decode(0.1))).toBe(true);
    expect(isLeft(Integer.decode(-0.5))).toBe(true);
    expect(isLeft(Integer.decode(NaN))).toBe(true);
    expect(isLeft(Integer.decode(Infinity))).toBe(true);
  });

  it('should reject non-number values', () => {
    expect(isLeft(Integer.decode('1'))).toBe(true);
    expect(isLeft(Integer.decode(null))).toBe(true);
    expect(isLeft(Integer.decode(undefined))).toBe(true);
  });
});

describe('PositiveNumber', () => {
  it('should accept positive numbers', () => {
    expect(isRight(PositiveNumber.decode(1))).toBe(true);
    expect(isRight(PositiveNumber.decode(0.1))).toBe(true);
    expect(isRight(PositiveNumber.decode(100))).toBe(true);
    expect(isRight(PositiveNumber.decode(0.0001))).toBe(true);
  });

  it('should reject zero and negative numbers', () => {
    expect(isLeft(PositiveNumber.decode(0))).toBe(true);
    expect(isLeft(PositiveNumber.decode(-1))).toBe(true);
    expect(isLeft(PositiveNumber.decode(-0.1))).toBe(true);
  });
});

describe('NonNegativeNumber', () => {
  it('should accept zero and positive numbers', () => {
    expect(isRight(NonNegativeNumber.decode(0))).toBe(true);
    expect(isRight(NonNegativeNumber.decode(1))).toBe(true);
    expect(isRight(NonNegativeNumber.decode(0.1))).toBe(true);
    expect(isRight(NonNegativeNumber.decode(100))).toBe(true);
  });

  it('should reject negative numbers', () => {
    expect(isLeft(NonNegativeNumber.decode(-1))).toBe(true);
    expect(isLeft(NonNegativeNumber.decode(-0.1))).toBe(true);
    expect(isLeft(NonNegativeNumber.decode(-100))).toBe(true);
  });
});

describe('PositiveInteger', () => {
  it('should accept positive integers', () => {
    expect(isRight(PositiveInteger.decode(1))).toBe(true);
    expect(isRight(PositiveInteger.decode(100))).toBe(true);
    expect(isRight(PositiveInteger.decode(999999))).toBe(true);
  });

  it('should reject zero, negative numbers, and non-integers', () => {
    expect(isLeft(PositiveInteger.decode(0))).toBe(true);
    expect(isLeft(PositiveInteger.decode(-1))).toBe(true);
    expect(isLeft(PositiveInteger.decode(1.5))).toBe(true);
    expect(isLeft(PositiveInteger.decode(-1.5))).toBe(true);
  });
});

describe('Port', () => {
  it('should accept valid port numbers', () => {
    expect(isRight(Port.decode(0))).toBe(true);
    expect(isRight(Port.decode(80))).toBe(true);
    expect(isRight(Port.decode(443))).toBe(true);
    expect(isRight(Port.decode(3000))).toBe(true);
    expect(isRight(Port.decode(8080))).toBe(true);
    expect(isRight(Port.decode(65535))).toBe(true);
  });

  it('should reject invalid port numbers', () => {
    expect(isLeft(Port.decode(-1))).toBe(true);
    expect(isLeft(Port.decode(65536))).toBe(true);
    expect(isLeft(Port.decode(100000))).toBe(true);
    expect(isLeft(Port.decode(80.5))).toBe(true);
  });
});

describe('Percentage', () => {
  it('should accept valid percentages (0-100)', () => {
    expect(isRight(Percentage.decode(0))).toBe(true);
    expect(isRight(Percentage.decode(50))).toBe(true);
    expect(isRight(Percentage.decode(100))).toBe(true);
    expect(isRight(Percentage.decode(33.33))).toBe(true);
    expect(isRight(Percentage.decode(99.99))).toBe(true);
  });

  it('should reject values outside 0-100 range', () => {
    expect(isLeft(Percentage.decode(-1))).toBe(true);
    expect(isLeft(Percentage.decode(-0.1))).toBe(true);
    expect(isLeft(Percentage.decode(100.1))).toBe(true);
    expect(isLeft(Percentage.decode(101))).toBe(true);
    expect(isLeft(Percentage.decode(200))).toBe(true);
  });
});
