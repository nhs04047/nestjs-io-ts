import { Email } from '../../src/extends';

describe('Email codec test suit', () => {
  test('should validate valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name+tag+sorting@example.com',
      'x@x.xx',
      'example-indeed@strange-example.com',
      'admin@mailserver1.ai',
    ];

    validEmails.forEach((email) => {
      const result = Email.decode(email);
      expect(result._tag).toBe('Right');
    });
  });

  test('should invalidate invalid email addresses', () => {
    const invalidEmails = [
      '',
      'plainaddress',
      'example.com',
      'user@example@example.com',
      '@missingusername.com',
      'username@.!com.my',
      'username123@.com',
    ];

    invalidEmails.forEach((email) => {
      const result = Email.decode(email);
      expect(result._tag).toBe('Left');
    });
  });

  test('should decode a valid email address into the correct type', () => {
    const validEmail = 'test@example.com';
    const result = Email.decode(validEmail);

    if (result._tag === 'Right') {
      expect(result.right).toBe(validEmail);
    } else {
      throw new Error('Expected a valid email to decode successfully.');
    }
  });

  test('should encode an email back into a string', () => {
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
