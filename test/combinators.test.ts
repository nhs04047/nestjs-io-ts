import { isLeft, isRight } from 'fp-ts/Either';
import * as t from 'io-ts';

import {
  crossValidate,
  nullable,
  optional,
  transform,
  withDefault,
} from '../src/combinators';

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

describe('crossValidate', () => {
  describe('password confirmation', () => {
    const PasswordResetCodec = crossValidate(
      t.type({
        password: t.string,
        confirmPassword: t.string,
      }),
      (data) => {
        if (data.password !== data.confirmPassword) {
          return [
            { field: 'confirmPassword', message: 'Passwords do not match' },
          ];
        }
        return [];
      },
    );

    it('should pass when passwords match', () => {
      const result = PasswordResetCodec.decode({
        password: 'secret123',
        confirmPassword: 'secret123',
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          password: 'secret123',
          confirmPassword: 'secret123',
        });
      }
    });

    it('should fail when passwords do not match', () => {
      const result = PasswordResetCodec.decode({
        password: 'secret123',
        confirmPassword: 'different',
      });
      expect(isLeft(result)).toBe(true);
    });

    it('should fail base validation first if types are wrong', () => {
      const result = PasswordResetCodec.decode({
        password: 123,
        confirmPassword: 'secret',
      });
      expect(isLeft(result)).toBe(true);
    });

    it('should fail base validation if fields are missing', () => {
      const result = PasswordResetCodec.decode({
        password: 'secret123',
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('date range validation', () => {
    const DateRangeCodec = crossValidate(
      t.type({
        startDate: t.string,
        endDate: t.string,
      }),
      (data) => {
        if (new Date(data.startDate) > new Date(data.endDate)) {
          return [
            { field: 'endDate', message: 'End date must be after start date' },
          ];
        }
        return [];
      },
    );

    it('should pass when start date is before end date', () => {
      const result = DateRangeCodec.decode({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });
      }
    });

    it('should pass when start date equals end date', () => {
      const result = DateRangeCodec.decode({
        startDate: '2024-06-15',
        endDate: '2024-06-15',
      });
      expect(isRight(result)).toBe(true);
    });

    it('should fail when start date is after end date', () => {
      const result = DateRangeCodec.decode({
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('multiple cross-validation errors', () => {
    const FormCodec = crossValidate(
      t.type({
        password: t.string,
        confirmPassword: t.string,
        email: t.string,
        confirmEmail: t.string,
      }),
      (data) => {
        const errors: Array<{ field: string; message: string }> = [];

        if (data.password !== data.confirmPassword) {
          errors.push({
            field: 'confirmPassword',
            message: 'Passwords do not match',
          });
        }

        if (data.email !== data.confirmEmail) {
          errors.push({
            field: 'confirmEmail',
            message: 'Emails do not match',
          });
        }

        return errors;
      },
    );

    it('should pass when all confirmations match', () => {
      const result = FormCodec.decode({
        password: 'secret',
        confirmPassword: 'secret',
        email: 'test@example.com',
        confirmEmail: 'test@example.com',
      });
      expect(isRight(result)).toBe(true);
    });

    it('should fail with single mismatch', () => {
      const result = FormCodec.decode({
        password: 'secret',
        confirmPassword: 'wrong',
        email: 'test@example.com',
        confirmEmail: 'test@example.com',
      });
      expect(isLeft(result)).toBe(true);
    });

    it('should fail with multiple mismatches', () => {
      const result = FormCodec.decode({
        password: 'secret',
        confirmPassword: 'wrong',
        email: 'test@example.com',
        confirmEmail: 'different@example.com',
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('conditional field validation', () => {
    const ShippingCodec = crossValidate(
      t.type({
        requiresShipping: t.boolean,
        address: optional(t.string),
      }),
      (data) => {
        if (data.requiresShipping && !data.address) {
          return [
            {
              field: 'address',
              message: 'Address is required when shipping is enabled',
            },
          ];
        }
        return [];
      },
    );

    it('should pass when shipping not required and no address', () => {
      const result = ShippingCodec.decode({
        requiresShipping: false,
        address: undefined,
      });
      expect(isRight(result)).toBe(true);
    });

    it('should pass when shipping required and address provided', () => {
      const result = ShippingCodec.decode({
        requiresShipping: true,
        address: '123 Main St',
      });
      expect(isRight(result)).toBe(true);
    });

    it('should fail when shipping required but no address', () => {
      const result = ShippingCodec.decode({
        requiresShipping: true,
        address: undefined,
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('encoding', () => {
    const SimpleCodec = crossValidate(t.type({ name: t.string }), () => []);

    it('should encode values correctly', () => {
      const encoded = SimpleCodec.encode({ name: 'test' });
      expect(encoded).toEqual({ name: 'test' });
    });
  });

  describe('is (type guard)', () => {
    const SimpleCodec = crossValidate(t.type({ name: t.string }), (data) =>
      data.name.length > 0 ? [] : [{ field: 'name', message: 'Required' }],
    );

    it('should return true for valid values (using base codec is)', () => {
      expect(SimpleCodec.is({ name: 'test' })).toBe(true);
    });

    it('should return false for invalid base type', () => {
      expect(SimpleCodec.is({ name: 123 })).toBe(false);
    });

    it('should return false for missing fields', () => {
      expect(SimpleCodec.is({})).toBe(false);
    });
  });

  describe('name', () => {
    const TestCodec = crossValidate(t.type({ x: t.number }), () => []);

    it('should have descriptive name', () => {
      expect(TestCodec.name).toBe('crossValidate({ x: number })');
    });
  });
});

describe('transform', () => {
  describe('string transformations', () => {
    const TrimmedString = transform(t.string, (s) => s.trim());

    it('should trim whitespace', () => {
      const result = TrimmedString.decode('  hello  ');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('hello');
      }
    });

    it('should pass through already trimmed strings', () => {
      const result = TrimmedString.decode('hello');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('hello');
      }
    });

    it('should fail for non-strings', () => {
      const result = TrimmedString.decode(123);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('lowercase transformation', () => {
    const LowercaseString = transform(t.string, (s) => s.toLowerCase());

    it('should convert to lowercase', () => {
      const result = LowercaseString.decode('HELLO WORLD');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('hello world');
      }
    });
  });

  describe('combined transformations', () => {
    const NormalizedEmail = transform(t.string, (s) => s.toLowerCase().trim());

    it('should normalize email', () => {
      const result = NormalizedEmail.decode('  USER@EXAMPLE.COM  ');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('user@example.com');
      }
    });
  });

  describe('type transformation (string to Date)', () => {
    const DateFromString = transform(t.string, (s) => new Date(s));

    it('should parse date string to Date object', () => {
      const result = DateFromString.decode('2024-01-15');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBeInstanceOf(Date);
        expect(result.right.getFullYear()).toBe(2024);
        expect(result.right.getMonth()).toBe(0); // January
        expect(result.right.getDate()).toBe(15);
      }
    });

    it('should fail for non-strings', () => {
      const result = DateFromString.decode(12345);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('number transformations', () => {
    const RoundedNumber = transform(t.number, (n) => Math.round(n));

    it('should round numbers', () => {
      const result = RoundedNumber.decode(3.7);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe(4);
      }
    });

    it('should handle already integer values', () => {
      const result = RoundedNumber.decode(5);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe(5);
      }
    });
  });

  describe('array transformations', () => {
    const SortedArray = transform(t.array(t.number), (arr) =>
      [...arr].sort((a, b) => a - b),
    );

    it('should sort array', () => {
      const result = SortedArray.decode([3, 1, 4, 1, 5]);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual([1, 1, 3, 4, 5]);
      }
    });

    it('should handle empty array', () => {
      const result = SortedArray.decode([]);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual([]);
      }
    });
  });

  describe('in t.type context', () => {
    const UserCodec = t.type({
      name: transform(t.string, (s) => s.trim()),
      email: transform(t.string, (s) => s.toLowerCase().trim()),
      age: transform(t.number, (n) => Math.floor(n)),
    });

    it('should transform all fields', () => {
      const result = UserCodec.decode({
        name: '  John Doe  ',
        email: '  USER@EXAMPLE.COM  ',
        age: 25.9,
      });
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          name: 'John Doe',
          email: 'user@example.com',
          age: 25,
        });
      }
    });

    it('should fail if any field has wrong type', () => {
      const result = UserCodec.decode({
        name: '  John  ',
        email: 123,
        age: 25,
      });
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('error handling in transformer', () => {
    const ThrowingTransform = transform(t.string, (s) => {
      if (s === 'error') {
        throw new Error('Transform error!');
      }
      return s.toUpperCase();
    });

    it('should handle transform success', () => {
      const result = ThrowingTransform.decode('hello');
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toBe('HELLO');
      }
    });

    it('should handle transform errors gracefully', () => {
      const result = ThrowingTransform.decode('error');
      expect(isLeft(result)).toBe(true);
    });
  });

  describe('chaining with other combinators', () => {
    it('should work with optional', () => {
      const OptionalTrimmed = optional(transform(t.string, (s) => s.trim()));

      const result1 = OptionalTrimmed.decode('  hello  ');
      expect(isRight(result1)).toBe(true);
      if (isRight(result1)) {
        expect(result1.right).toBe('hello');
      }

      const result2 = OptionalTrimmed.decode(undefined);
      expect(isRight(result2)).toBe(true);
      if (isRight(result2)) {
        expect(result2.right).toBeUndefined();
      }
    });

    it('should work with withDefault', () => {
      const DefaultTrimmed = withDefault(
        transform(t.string, (s) => s.trim()),
        'default',
      );

      const result1 = DefaultTrimmed.decode('  hello  ');
      expect(isRight(result1)).toBe(true);
      if (isRight(result1)) {
        expect(result1.right).toBe('hello');
      }

      const result2 = DefaultTrimmed.decode(undefined);
      expect(isRight(result2)).toBe(true);
      if (isRight(result2)) {
        expect(result2.right).toBe('default');
      }
    });
  });

  describe('encoding', () => {
    const TrimmedString = transform(t.string, (s) => s.trim());

    it('should encode values using base codec', () => {
      // Note: encoding doesn't reverse the transform, it uses base codec
      const encoded = TrimmedString.encode('hello');
      expect(encoded).toBe('hello');
    });
  });

  describe('is (type guard)', () => {
    const TrimmedString = transform(t.string, (s) => s.trim());

    it('should return true for valid base type', () => {
      expect(TrimmedString.is('hello')).toBe(true);
    });

    it('should return false for invalid types', () => {
      expect(TrimmedString.is(123)).toBe(false);
      expect(TrimmedString.is(null)).toBe(false);
    });
  });

  describe('name', () => {
    const TrimmedString = transform(t.string, (s) => s.trim());

    it('should have descriptive name', () => {
      expect(TrimmedString.name).toBe('transform(string)');
    });
  });
});
