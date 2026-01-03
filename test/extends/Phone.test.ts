import { isLeft, isRight } from 'fp-ts/Either';

import { Phone } from '../../src/extends';

describe('Phone', () => {
  describe('valid phone numbers', () => {
    const validPhones = [
      '+1-234-567-8900',
      '+82 10 1234 5678',
      '+821012345678',
      '(555) 123-4567',
      '555-123-4567',
      '5551234567',
      '+44 20 7946 0958',
      '+1 (555) 123-4567',
      '123-456-7890',
      '+49 30 12345678',
    ];

    validPhones.forEach((phone) => {
      it(`should accept: ${phone}`, () => {
        expect(isRight(Phone.decode(phone))).toBe(true);
      });
    });
  });

  describe('invalid phone numbers', () => {
    const invalidPhones = [
      { value: 'abc', desc: 'letters only' },
      { value: '123', desc: 'too short (3 digits)' },
      { value: '12345', desc: 'too short (5 digits)' },
      { value: '', desc: 'empty string' },
      { value: '+', desc: 'only plus sign' },
      { value: 'phone: 123-456-7890', desc: 'contains text' },
    ];

    invalidPhones.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(Phone.decode(value))).toBe(true);
      });
    });

    it('should reject non-string values', () => {
      expect(isLeft(Phone.decode(1234567890))).toBe(true);
      expect(isLeft(Phone.decode(null))).toBe(true);
      expect(isLeft(Phone.decode(undefined))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should accept numbers with E.164 max length (15 digits)', () => {
      expect(isRight(Phone.decode('+123456789012345'))).toBe(true);
    });

    it('should reject numbers exceeding E.164 max length', () => {
      expect(isLeft(Phone.decode('+1234567890123456'))).toBe(true);
    });
  });
});
