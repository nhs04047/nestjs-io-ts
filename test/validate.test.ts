import * as t from 'io-ts';

import { createIoTsDto } from '../src/dto';
import { IoTsValidationException } from '../src/exception';
import { decodeAndThrow, formatErrors } from '../src/validate';

describe('formatErrors', () => {
  it('should format single field error correctly', () => {
    const codec = t.type({ name: t.string });
    const result = codec.decode({ name: 123 });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].expected).toBe('string');
      expect(errors[0].message).toContain('Expected string');
    }
  });

  it('should format multiple field errors correctly', () => {
    const codec = t.type({
      name: t.string,
      age: t.number,
    });
    const result = codec.decode({ name: 123, age: 'not a number' });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors.length).toBeGreaterThanOrEqual(2);
      expect(errors.some((e) => e.field === 'name')).toBe(true);
      expect(errors.some((e) => e.field === 'age')).toBe(true);
    }
  });

  it('should handle nested object errors', () => {
    const AddressCodec = t.type({
      city: t.string,
      zip: t.string,
    });
    const PersonCodec = t.type({
      name: t.string,
      address: AddressCodec,
    });

    const result = PersonCodec.decode({
      name: 'John',
      address: { city: 123, zip: 456 },
    });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors.some((e) => e.field.includes('address'))).toBe(true);
    }
  });

  it('should include actual value in error', () => {
    const codec = t.type({ count: t.number });
    const result = codec.decode({ count: 'not-a-number' });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors[0].value).toBe('not-a-number');
    }
  });

  it('should handle undefined values', () => {
    const codec = t.type({ required: t.string });
    const result = codec.decode({});

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors[0].field).toBe('required');
      expect(errors[0].code).toBe('REQUIRED');
      expect(errors[0].message).toBe('Field is required');
    }
  });

  it('should handle null values', () => {
    const codec = t.type({ value: t.string });
    const result = codec.decode({ value: null });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors[0].code).toBe('REQUIRED');
      expect(errors[0].message).toBe('Field is required');
    }
  });

  it('should handle array values', () => {
    const codec = t.type({ value: t.string });
    const result = codec.decode({ value: [1, 2, 3] });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors[0].message).toContain('array');
    }
  });

  it('should format array item errors with bracket notation', () => {
    const ItemCodec = t.type({
      name: t.string,
      price: t.number,
    });
    const OrderCodec = t.type({
      items: t.array(ItemCodec),
    });

    const result = OrderCodec.decode({
      items: [
        { name: 'item1', price: 100 },
        { name: 123, price: 'wrong' },
        { name: 'item3', price: 300 },
      ],
    });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors.some((e) => e.field === 'items[1].name')).toBe(true);
      expect(errors.some((e) => e.field === 'items[1].price')).toBe(true);
    }
  });

  it('should format simple array errors with bracket notation', () => {
    const codec = t.type({
      tags: t.array(t.string),
    });

    const result = codec.decode({
      tags: ['valid', 123, 'also-valid'],
    });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors[0].field).toBe('tags[1]');
    }
  });

  it('should format deeply nested array errors correctly', () => {
    const AddressCodec = t.type({
      street: t.string,
    });
    const PersonCodec = t.type({
      addresses: t.array(AddressCodec),
    });
    const CompanyCodec = t.type({
      employees: t.array(PersonCodec),
    });

    const result = CompanyCodec.decode({
      employees: [
        { addresses: [{ street: '123 Main St' }] },
        { addresses: [{ street: 456 }] }, // Invalid: street should be string
      ],
    });

    if (result._tag === 'Left') {
      const errors = formatErrors(result.left);

      expect(errors[0].field).toBe('employees[1].addresses[0].street');
    }
  });
});

describe('decodeAndThrow', () => {
  const UserCodec = t.type({
    id: t.string,
    email: t.string,
  });

  describe('with codec', () => {
    it('should return decoded value for valid input', () => {
      const input = { id: '123', email: 'test@example.com' };
      const result = decodeAndThrow(input, UserCodec);

      expect(result).toEqual(input);
    });

    it('should throw IoTsValidationException for invalid input', () => {
      const input = { id: 123, email: 'test@example.com' };

      expect(() => decodeAndThrow(input, UserCodec)).toThrow(
        IoTsValidationException,
      );
    });

    it('should provide structured errors on failure', () => {
      const input = { id: 123, email: null };

      try {
        decodeAndThrow(input, UserCodec);
        fail('Should have thrown');
      } catch (error) {
        const exception = error as IoTsValidationException;
        const errors = exception.getErrors();

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.field === 'id')).toBe(true);
      }
    });
  });

  describe('with IoTsDto', () => {
    // Use createIoTsDto directly without extending
    const UserDto = createIoTsDto(UserCodec);

    it('should return decoded value for valid input', () => {
      const input = { id: '123', email: 'test@example.com' };
      const result = decodeAndThrow(input, UserDto);

      expect(result).toEqual(input);
    });

    it('should throw IoTsValidationException for invalid input', () => {
      const input = { id: 123, email: 'test@example.com' };

      expect(() => decodeAndThrow(input, UserDto)).toThrow(
        IoTsValidationException,
      );
    });
  });

  describe('complex types', () => {
    it('should handle union types', () => {
      const StatusCodec = t.union([
        t.literal('active'),
        t.literal('inactive'),
        t.literal('pending'),
      ]);

      expect(decodeAndThrow('active', StatusCodec)).toBe('active');
      expect(() => decodeAndThrow('invalid', StatusCodec)).toThrow(
        IoTsValidationException,
      );
    });

    it('should handle optional fields', () => {
      const OptionalCodec = t.type({
        required: t.string,
        optional: t.union([t.string, t.undefined]),
      });

      const withOptional = decodeAndThrow(
        { required: 'test', optional: 'value' },
        OptionalCodec,
      );
      expect(withOptional).toEqual({ required: 'test', optional: 'value' });

      const withoutOptional = decodeAndThrow(
        { required: 'test', optional: undefined },
        OptionalCodec,
      );
      expect(withoutOptional).toEqual({
        required: 'test',
        optional: undefined,
      });
    });

    it('should handle array types', () => {
      const ArrayCodec = t.array(t.string);

      expect(decodeAndThrow(['a', 'b', 'c'], ArrayCodec)).toEqual([
        'a',
        'b',
        'c',
      ]);
      expect(() => decodeAndThrow(['a', 1, 'c'], ArrayCodec)).toThrow(
        IoTsValidationException,
      );
    });
  });
});
