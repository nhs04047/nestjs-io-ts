import { isLeft, isRight } from 'fp-ts/Either';
import * as t from 'io-ts';

import { nullable, optional, withDefault } from '../src/combinators';

describe('optional', () => {
  const OptionalString = optional(t.string);

  describe('type checking', () => {
    it('should accept the base type', () => {
      const result = OptionalString.decode('hello');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('hello');
      }
    });

    it('should accept undefined', () => {
      const result = OptionalString.decode(undefined);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBeUndefined();
      }
    });

    it('should reject null', () => {
      const result = OptionalString.decode(null);
      expect(isLeft(result)).toBe(true);
    });

    it('should reject invalid types', () => {
      const result = OptionalString.decode(123);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('with complex types', () => {
    it('should work with branded types', () => {
      interface PositiveBrand {
        readonly Positive: unique symbol;
      }
      const Positive = t.brand(
        t.number,
        (n): n is t.Branded<number, PositiveBrand> => n > 0,
        'Positive',
      );

      const OptionalPositive = optional(Positive);

      expect(isRight(OptionalPositive.decode(5))).toBe(true);
      expect(isRight(OptionalPositive.decode(undefined))).toBe(true);
      expect(isLeft(OptionalPositive.decode(-1))).toBe(true);
      expect(isLeft(OptionalPositive.decode(null))).toBe(true);
    });

    it('should work with object types', () => {
      const Address = t.type({
        street: t.string,
        city: t.string,
      });

      const OptionalAddress = optional(Address);

      expect(
        isRight(OptionalAddress.decode({ street: '123 Main', city: 'NYC' })),
      ).toBe(true);
      expect(isRight(OptionalAddress.decode(undefined))).toBe(true);
      expect(isLeft(OptionalAddress.decode({ street: '123 Main' }))).toBe(true);
      expect(isLeft(OptionalAddress.decode(null))).toBe(true);
    });
  });

  describe('in t.type context', () => {
    const UserCodec = t.type({
      name: t.string,
      nickname: optional(t.string),
    });

    it('should allow missing optional field', () => {
      const result = UserCodec.decode({ name: 'John' });
      expect(isRight(result)).toBe(true);
    });

    it('should allow undefined optional field', () => {
      const result = UserCodec.decode({ name: 'John', nickname: undefined });
      expect(isRight(result)).toBe(true);
    });

    it('should allow present optional field', () => {
      const result = UserCodec.decode({ name: 'John', nickname: 'Johnny' });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.nickname).toBe('Johnny');
      }
    });

    it('should reject null for optional field', () => {
      const result = UserCodec.decode({ name: 'John', nickname: null });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('encoding', () => {
    it('should encode values correctly', () => {
      expect(OptionalString.encode('hello')).toBe('hello');
      expect(OptionalString.encode(undefined)).toBeUndefined();
    });
  });

  describe('is (type guard)', () => {
    it('should return true for valid values', () => {
      expect(OptionalString.is('hello')).toBe(true);
      expect(OptionalString.is(undefined)).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(OptionalString.is(null)).toBe(false);
      expect(OptionalString.is(123)).toBe(false);
    });
  });
});

describe('nullable', () => {
  const NullableString = nullable(t.string);

  describe('type checking', () => {
    it('should accept the base type', () => {
      const result = NullableString.decode('hello');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('hello');
      }
    });

    it('should accept null', () => {
      const result = NullableString.decode(null);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBeNull();
      }
    });

    it('should reject undefined', () => {
      const result = NullableString.decode(undefined);
      expect(isLeft(result)).toBe(true);
    });

    it('should reject invalid types', () => {
      const result = NullableString.decode(123);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('with complex types', () => {
    it('should work with branded types', () => {
      interface PositiveBrand {
        readonly Positive: unique symbol;
      }
      const Positive = t.brand(
        t.number,
        (n): n is t.Branded<number, PositiveBrand> => n > 0,
        'Positive',
      );

      const NullablePositive = nullable(Positive);

      expect(isRight(NullablePositive.decode(5))).toBe(true);
      expect(isRight(NullablePositive.decode(null))).toBe(true);
      expect(isLeft(NullablePositive.decode(-1))).toBe(true);
      expect(isLeft(NullablePositive.decode(undefined))).toBe(true);
    });

    it('should work with object types', () => {
      const Address = t.type({
        street: t.string,
        city: t.string,
      });

      const NullableAddress = nullable(Address);

      expect(
        isRight(NullableAddress.decode({ street: '123 Main', city: 'NYC' })),
      ).toBe(true);
      expect(isRight(NullableAddress.decode(null))).toBe(true);
      expect(isLeft(NullableAddress.decode({ street: '123 Main' }))).toBe(true);
      expect(isLeft(NullableAddress.decode(undefined))).toBe(true);
    });
  });

  describe('in t.type context', () => {
    const UserCodec = t.type({
      name: t.string,
      deletedAt: nullable(t.string),
    });

    it('should require nullable field to be present', () => {
      const result = UserCodec.decode({ name: 'John' });
      expect(isLeft(result)).toBe(true);
    });

    it('should allow null for nullable field', () => {
      const result = UserCodec.decode({ name: 'John', deletedAt: null });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.deletedAt).toBeNull();
      }
    });

    it('should allow value for nullable field', () => {
      const result = UserCodec.decode({
        name: 'John',
        deletedAt: '2024-01-01',
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.deletedAt).toBe('2024-01-01');
      }
    });

    it('should reject undefined for nullable field', () => {
      const result = UserCodec.decode({ name: 'John', deletedAt: undefined });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('encoding', () => {
    it('should encode values correctly', () => {
      expect(NullableString.encode('hello')).toBe('hello');
      expect(NullableString.encode(null)).toBeNull();
    });
  });

  describe('is (type guard)', () => {
    it('should return true for valid values', () => {
      expect(NullableString.is('hello')).toBe(true);
      expect(NullableString.is(null)).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(NullableString.is(undefined)).toBe(false);
      expect(NullableString.is(123)).toBe(false);
    });
  });
});

describe('withDefault', () => {
  const DefaultString = withDefault(t.string, 'default');

  describe('type checking', () => {
    it('should accept the base type', () => {
      const result = DefaultString.decode('hello');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('hello');
      }
    });

    it('should use default value for undefined', () => {
      const result = DefaultString.decode(undefined);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('default');
      }
    });

    it('should reject null', () => {
      const result = DefaultString.decode(null);
      expect(isLeft(result)).toBe(true);
    });

    it('should reject invalid types', () => {
      const result = DefaultString.decode(123);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('with different types', () => {
    it('should work with numbers', () => {
      const DefaultNumber = withDefault(t.number, 0);

      const result1 = DefaultNumber.decode(undefined);
      expect(isRight(result1)).toBe(true);
      if (isRight(result1)) {
        expect(result1.right).toBe(0);
      }

      const result2 = DefaultNumber.decode(42);
      expect(isRight(result2)).toBe(true);
      if (isRight(result2)) {
        expect(result2.right).toBe(42);
      }
    });

    it('should work with booleans', () => {
      const DefaultBoolean = withDefault(t.boolean, true);

      const result1 = DefaultBoolean.decode(undefined);
      expect(isRight(result1)).toBe(true);
      if (isRight(result1)) {
        expect(result1.right).toBe(true);
      }

      const result2 = DefaultBoolean.decode(false);
      expect(isRight(result2)).toBe(true);
      if (isRight(result2)) {
        expect(result2.right).toBe(false);
      }
    });

    it('should work with arrays', () => {
      const DefaultArray = withDefault(t.array(t.string), []);

      const result1 = DefaultArray.decode(undefined);
      expect(isRight(result1)).toBe(true);
      if (isRight(result1)) {
        expect(result1.right).toEqual([]);
      }

      const result2 = DefaultArray.decode(['a', 'b']);
      expect(isRight(result2)).toBe(true);
      if (isRight(result2)) {
        expect(result2.right).toEqual(['a', 'b']);
      }
    });

    it('should work with objects', () => {
      const DefaultObject = withDefault(t.type({ x: t.number }), { x: 0 });

      const result1 = DefaultObject.decode(undefined);
      expect(isRight(result1)).toBe(true);
      if (isRight(result1)) {
        expect(result1.right).toEqual({ x: 0 });
      }

      const result2 = DefaultObject.decode({ x: 5 });
      expect(isRight(result2)).toBe(true);
      if (isRight(result2)) {
        expect(result2.right).toEqual({ x: 5 });
      }
    });
  });

  describe('in t.type context', () => {
    const UserCodec = t.type({
      name: t.string,
      role: withDefault(t.string, 'user'),
      isActive: withDefault(t.boolean, true),
    });

    it('should use defaults for missing fields', () => {
      const result = UserCodec.decode({ name: 'John' });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          name: 'John',
          role: 'user',
          isActive: true,
        });
      }
    });

    it('should use provided values over defaults', () => {
      const result = UserCodec.decode({
        name: 'John',
        role: 'admin',
        isActive: false,
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          name: 'John',
          role: 'admin',
          isActive: false,
        });
      }
    });

    it('should use defaults for explicitly undefined fields', () => {
      const result = UserCodec.decode({
        name: 'John',
        role: undefined,
        isActive: undefined,
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          name: 'John',
          role: 'user',
          isActive: true,
        });
      }
    });
  });

  describe('encoding', () => {
    it('should encode values correctly', () => {
      expect(DefaultString.encode('hello')).toBe('hello');
      expect(DefaultString.encode('default')).toBe('default');
    });
  });

  describe('is (type guard)', () => {
    it('should return true for valid values', () => {
      expect(DefaultString.is('hello')).toBe(true);
      expect(DefaultString.is('default')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(DefaultString.is(undefined)).toBe(false);
      expect(DefaultString.is(null)).toBe(false);
      expect(DefaultString.is(123)).toBe(false);
    });
  });

  describe('name', () => {
    it('should have descriptive name', () => {
      expect(DefaultString.name).toBe('withDefault(string, "default")');
    });
  });
});
