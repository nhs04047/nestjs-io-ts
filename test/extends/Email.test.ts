import { isLeft, isRight } from 'fp-ts/Either';

import { Email } from '../../src/extends';

describe('Email', () => {
  describe('valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name+tag+sorting@example.com',
      'x@x.xx',
      'example-indeed@strange-example.com',
      'admin@mailserver1.ai',
      'user123@example.com',
      'a@example.com',
      'user@my-domain.com',
      'user@domain.co.uk',
      'firstname.lastname@company.org',
      'user_name@example.com',
      'user-name@example.com',
      '1234567890@example.com',
      'email@example.name',
      'email@example.museum',
      '_______@example.com',
      'email@example.co.jp',
    ];

    validEmails.forEach((email) => {
      it(`should accept: ${email}`, () => {
        expect(isRight(Email.decode(email))).toBe(true);
      });
    });
  });

  describe('invalid email addresses', () => {
    const invalidEmails = [
      { value: '', desc: 'empty string' },
      { value: 'plainaddress', desc: 'no @ symbol' },
      { value: 'example.com', desc: 'missing local part' },
      { value: 'user@example@example.com', desc: 'multiple @ symbols' },
      { value: '@missingusername.com', desc: 'missing local part with @' },
      { value: 'username@.!com.my', desc: 'invalid domain characters' },
      { value: 'username123@.com', desc: 'domain starts with dot' },
      { value: 'test..test@example.com', desc: 'consecutive dots' },
      { value: '.test@example.com', desc: 'starts with dot' },
      { value: 'test.@example.com', desc: 'ends with dot before @' },
      { value: 'test@-example.com', desc: 'domain starts with hyphen' },
    ];

    invalidEmails.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(Email.decode(value))).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should reject emails exceeding RFC 5321 length limits', () => {
      // Local part > 64 characters
      const longLocal = 'a'.repeat(65) + '@example.com';
      expect(isLeft(Email.decode(longLocal))).toBe(true);

      // Total email > 254 characters
      const veryLongEmail = 'a'.repeat(200) + '@' + 'b'.repeat(100) + '.com';
      expect(isLeft(Email.decode(veryLongEmail))).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(isLeft(Email.decode(123))).toBe(true);
      expect(isLeft(Email.decode(null))).toBe(true);
      expect(isLeft(Email.decode(undefined))).toBe(true);
      expect(isLeft(Email.decode({}))).toBe(true);
    });
  });

  describe('encoding', () => {
    it('should decode a valid email address into the correct type', () => {
      const validEmail = 'test@example.com';
      const result = Email.decode(validEmail);

      if (result._tag === 'Right') {
        expect(result.right).toBe(validEmail);
      } else {
        throw new Error('Expected a valid email to decode successfully.');
      }
    });

    it('should encode an email back into a string', () => {
      const validEmail = 'test@example.com';
      const result = Email.decode(validEmail);

      if (result._tag === 'Right') {
        const encoded = Email.encode(result.right);
        expect(encoded).toBe(validEmail);
      } else {
        throw new Error('Expected a valid email to decode successfully.');
      }
    });
  });
});
