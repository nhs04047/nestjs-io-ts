import * as t from 'io-ts';

import { createIoTsDto, Email, formatErrors, withMessage } from '../src';

describe('withMessage', () => {
  describe('basic functionality', () => {
    it('should create a codec with custom error messages', () => {
      const customEmail = withMessage(Email, {
        invalid: 'Please enter a valid email',
        required: 'Email is required',
      });

      expect(customEmail.name).toBe('Email');
      expect(typeof customEmail.decode).toBe('function');
    });

    it('should accept a simple message function', () => {
      const customNumber = withMessage(
        t.number,
        (value) => `Expected number, got ${typeof value}`,
      );

      expect(customNumber.name).toBe('number');
    });
  });

  describe('validation with custom messages', () => {
    it('should use custom invalid message for branded types', () => {
      const CustomEmailCodec = t.type({
        email: withMessage(Email, {
          invalid: 'Please enter a valid email address',
        }),
      });

      const result = CustomEmailCodec.decode({ email: 'not-an-email' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('Please enter a valid email address');
        expect(errors[0].code).toBe('INVALID_FORMAT');
      }
    });

    it('should use custom required message', () => {
      const CustomEmailCodec = t.type({
        email: withMessage(Email, {
          required: 'Email is required for registration',
        }),
      });

      const result = CustomEmailCodec.decode({ email: undefined });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('Email is required for registration');
        expect(errors[0].code).toBe('REQUIRED');
      }
    });

    it('should use message function with access to value', () => {
      const CustomAgeCodec = t.type({
        age: withMessage(t.number, {
          invalid: (value) =>
            `Age must be a number, but received "${value}" (${typeof value})`,
        }),
      });

      const result = CustomAgeCodec.decode({ age: 'twenty' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
          'Age must be a number, but received "twenty" (string)',
        );
      }
    });

    it('should use custom code and suggestion', () => {
      const CustomUsernameCodec = t.type({
        username: withMessage(t.string, {
          invalid: 'Invalid username format',
          code: 'INVALID_FORMAT',
          suggestion: 'Use only alphanumeric characters',
        }),
      });

      const result = CustomUsernameCodec.decode({ username: 123 });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe('INVALID_FORMAT');
        expect(errors[0].suggestion).toBe('Use only alphanumeric characters');
      }
    });
  });

  describe('integration with createIoTsDto', () => {
    it('should work with createIoTsDto', () => {
      const UserCodec = t.type({
        email: withMessage(Email, {
          invalid: 'Invalid email format',
          required: 'Email is required',
        }),
        age: withMessage(t.number, {
          invalid: (v) => `Age should be a number, got ${typeof v}`,
        }),
      });

      const UserDto = createIoTsDto(UserCodec);

      expect(() => {
        UserDto.create({ email: 'bad', age: 'not-a-number' });
      }).toThrow();

      // Valid data should work
      const validUser = UserDto.create({
        email: 'test@example.com',
        age: 25,
      });
      expect(validUser.email).toBe('test@example.com');
      expect(validUser.age).toBe(25);
    });
  });

  describe('fallback to default messages', () => {
    it('should fall back to default branded type messages when no custom message is provided', () => {
      const CodecWithPartialCustom = t.type({
        email: withMessage(Email, {
          required: 'Email is required', // only required, no invalid
        }),
      });

      const result = CodecWithPartialCustom.decode({ email: 'invalid-email' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors).toHaveLength(1);
        // Should fall back to default Email error message
        expect(errors[0].message).toBe('Invalid email format');
        expect(errors[0].code).toBe('INVALID_EMAIL');
      }
    });
  });
});
