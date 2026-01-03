import { isLeft, isRight } from 'fp-ts/Either';

import { DateString, DateTimeString } from '../../src/extends';

describe('DateString', () => {
  describe('valid date strings', () => {
    const validDates = [
      '2024-01-01',
      '2024-12-31',
      '2024-02-29', // leap year
      '2000-01-01',
      '1999-12-31',
      '2024-06-15',
    ];

    validDates.forEach((date) => {
      it(`should accept: ${date}`, () => {
        expect(isRight(DateString.decode(date))).toBe(true);
      });
    });
  });

  describe('invalid date strings', () => {
    const invalidDates = [
      { value: '2024-02-30', desc: 'invalid day (Feb 30)' },
      { value: '2023-02-29', desc: 'invalid day (Feb 29 non-leap year)' },
      { value: '2024-13-01', desc: 'invalid month (13)' },
      { value: '2024-00-01', desc: 'invalid month (00)' },
      { value: '2024-01-32', desc: 'invalid day (32)' },
      { value: '2024-01-00', desc: 'invalid day (00)' },
      { value: '01-15-2024', desc: 'wrong format (MM-DD-YYYY)' },
      { value: '15/01/2024', desc: 'wrong format (DD/MM/YYYY)' },
      { value: '2024/01/15', desc: 'wrong separator' },
      { value: '', desc: 'empty string' },
      { value: 'not-a-date', desc: 'random string' },
      { value: '2024-1-15', desc: 'single digit month' },
      { value: '2024-01-5', desc: 'single digit day' },
    ];

    invalidDates.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(DateString.decode(value))).toBe(true);
      });
    });

    it('should reject non-string values', () => {
      expect(isLeft(DateString.decode(123))).toBe(true);
      expect(isLeft(DateString.decode(new Date()))).toBe(true);
      expect(isLeft(DateString.decode(null))).toBe(true);
    });
  });
});

describe('DateTimeString', () => {
  describe('valid datetime strings', () => {
    const validDateTimes = [
      '2024-01-15T10:30:00Z',
      '2024-01-15T10:30:00.000Z',
      '2024-01-15T10:30:00+09:00',
      '2024-01-15T10:30:00-05:00',
      '2024-01-15T00:00:00Z',
      '2024-01-15T23:59:59Z',
      '2024-01-15T10:30:00.123Z',
      '2024-12-31T23:59:59.999Z',
    ];

    validDateTimes.forEach((datetime) => {
      it(`should accept: ${datetime}`, () => {
        expect(isRight(DateTimeString.decode(datetime))).toBe(true);
      });
    });
  });

  describe('invalid datetime strings', () => {
    const invalidDateTimes = [
      { value: '2024-01-15', desc: 'date only (no time)' },
      { value: '10:30:00', desc: 'time only (no date)' },
      { value: '', desc: 'empty string' },
      { value: 'not-a-datetime', desc: 'random string' },
      { value: '2024-01-15 10:30:00', desc: 'space instead of T' },
    ];

    invalidDateTimes.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(DateTimeString.decode(value))).toBe(true);
      });
    });

    it('should reject non-string values', () => {
      expect(isLeft(DateTimeString.decode(123))).toBe(true);
      expect(isLeft(DateTimeString.decode(new Date()))).toBe(true);
      expect(isLeft(DateTimeString.decode(null))).toBe(true);
    });
  });
});
