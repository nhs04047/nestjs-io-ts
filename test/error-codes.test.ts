import * as t from 'io-ts';

import {
  Base64,
  DateString,
  DateTimeString,
  Email,
  formatErrors,
  HexColor,
  Integer,
  IP,
  IPv4,
  IPv6,
  JWT,
  LowercaseString,
  NonEmptyString,
  NonNegativeNumber,
  Percentage,
  Phone,
  Port,
  PositiveInteger,
  PositiveNumber,
  Slug,
  TrimmedString,
  UppercaseString,
  URL,
  UUID,
} from '../src';

describe('Error Codes and Suggestions', () => {
  describe('branded type error codes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testCases: Array<{
      name: string;
      codec: t.Type<any, any, any>;
      invalidValue: unknown;
      expectedCode: string;
      expectedMessage: string;
    }> = [
      {
        name: 'Email',
        codec: Email,
        invalidValue: 'not-an-email',
        expectedCode: 'INVALID_EMAIL',
        expectedMessage: 'Invalid email format',
      },
      {
        name: 'UUID',
        codec: UUID,
        invalidValue: 'not-a-uuid',
        expectedCode: 'INVALID_UUID',
        expectedMessage: 'Invalid UUID format',
      },
      {
        name: 'URL',
        codec: URL,
        invalidValue: 'not-a-url',
        expectedCode: 'INVALID_URL',
        expectedMessage: 'Invalid URL format',
      },
      {
        name: 'Phone',
        codec: Phone,
        invalidValue: 'abc',
        expectedCode: 'INVALID_PHONE',
        expectedMessage: 'Invalid phone number format',
      },
      {
        name: 'DateString',
        codec: DateString,
        invalidValue: 'not-a-date',
        expectedCode: 'INVALID_DATE',
        expectedMessage: 'Invalid date format',
      },
      {
        name: 'DateTimeString',
        codec: DateTimeString,
        invalidValue: 'not-a-datetime',
        expectedCode: 'INVALID_DATETIME',
        expectedMessage: 'Invalid datetime format',
      },
      {
        name: 'IPv4',
        codec: IPv4,
        invalidValue: 'not-an-ip',
        expectedCode: 'INVALID_IPV4',
        expectedMessage: 'Invalid IPv4 address',
      },
      {
        name: 'IPv6',
        codec: IPv6,
        invalidValue: 'not-an-ip',
        expectedCode: 'INVALID_IPV6',
        expectedMessage: 'Invalid IPv6 address',
      },
      {
        name: 'IP',
        codec: IP,
        invalidValue: 'not-an-ip',
        expectedCode: 'INVALID_IP',
        expectedMessage: 'Invalid IP address',
      },
      {
        name: 'Integer',
        codec: Integer,
        invalidValue: 3.14,
        expectedCode: 'INVALID_INTEGER',
        expectedMessage: 'Value must be an integer',
      },
      {
        name: 'PositiveNumber',
        codec: PositiveNumber,
        invalidValue: -1,
        expectedCode: 'INVALID_POSITIVE_NUMBER',
        expectedMessage: 'Value must be a positive number',
      },
      {
        name: 'NonNegativeNumber',
        codec: NonNegativeNumber,
        invalidValue: -1,
        expectedCode: 'INVALID_NON_NEGATIVE_NUMBER',
        expectedMessage: 'Value must be non-negative',
      },
      {
        name: 'PositiveInteger',
        codec: PositiveInteger,
        invalidValue: 0,
        expectedCode: 'INVALID_POSITIVE_INTEGER',
        expectedMessage: 'Value must be a positive integer',
      },
      {
        name: 'Port',
        codec: Port,
        invalidValue: 70000,
        expectedCode: 'INVALID_PORT',
        expectedMessage: 'Invalid port number',
      },
      {
        name: 'Percentage',
        codec: Percentage,
        invalidValue: 150,
        expectedCode: 'INVALID_PERCENTAGE',
        expectedMessage: 'Invalid percentage value',
      },
      {
        name: 'NonEmptyString',
        codec: NonEmptyString,
        invalidValue: '',
        expectedCode: 'INVALID_NON_EMPTY_STRING',
        expectedMessage: 'Value cannot be empty',
      },
      {
        name: 'TrimmedString',
        codec: TrimmedString,
        invalidValue: '  spaces  ',
        expectedCode: 'INVALID_TRIMMED_STRING',
        expectedMessage: 'Value cannot have leading or trailing whitespace',
      },
      {
        name: 'LowercaseString',
        codec: LowercaseString,
        invalidValue: 'UPPERCASE',
        expectedCode: 'INVALID_LOWERCASE_STRING',
        expectedMessage: 'Value must be lowercase',
      },
      {
        name: 'UppercaseString',
        codec: UppercaseString,
        invalidValue: 'lowercase',
        expectedCode: 'INVALID_UPPERCASE_STRING',
        expectedMessage: 'Value must be uppercase',
      },
      {
        name: 'HexColor',
        codec: HexColor,
        invalidValue: 'not-a-color',
        expectedCode: 'INVALID_HEX_COLOR',
        expectedMessage: 'Invalid hex color code',
      },
      {
        name: 'Slug',
        codec: Slug,
        invalidValue: 'Not A Slug!',
        expectedCode: 'INVALID_SLUG',
        expectedMessage: 'Invalid slug format',
      },
      {
        name: 'Base64',
        codec: Base64,
        invalidValue: 'not base64!!!',
        expectedCode: 'INVALID_BASE64',
        expectedMessage: 'Invalid Base64 encoding',
      },
      {
        name: 'JWT',
        codec: JWT,
        invalidValue: 'not-a-jwt',
        expectedCode: 'INVALID_JWT',
        expectedMessage: 'Invalid JWT format',
      },
    ];

    testCases.forEach(
      ({ name, codec, invalidValue, expectedCode, expectedMessage }) => {
        it(`should return ${expectedCode} for invalid ${name}`, () => {
          const TestCodec = t.type({ field: codec });
          const result = TestCodec.decode({ field: invalidValue });

          expect(result._tag).toBe('Left');
          if (result._tag === 'Left') {
            const errors = formatErrors(result.left);
            expect(errors).toHaveLength(1);
            expect(errors[0].code).toBe(expectedCode);
            expect(errors[0].message).toBe(expectedMessage);
            expect(errors[0].suggestion).toBeDefined();
          }
        });
      },
    );
  });

  describe('required field error', () => {
    it('should return REQUIRED code for undefined fields', () => {
      const TestCodec = t.type({
        name: t.string,
        age: t.number,
      });

      const result = TestCodec.decode({ name: 'John' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        const ageError = errors.find((e) => e.field === 'age');
        expect(ageError).toBeDefined();
        expect(ageError?.code).toBe('REQUIRED');
        expect(ageError?.message).toBe('Field is required');
      }
    });

    it('should return REQUIRED code for null fields', () => {
      const TestCodec = t.type({
        name: t.string,
      });

      const result = TestCodec.decode({ name: null });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors[0].code).toBe('REQUIRED');
      }
    });
  });

  describe('generic type mismatch error', () => {
    it('should return INVALID_TYPE for primitive type mismatches', () => {
      const TestCodec = t.type({
        age: t.number,
      });

      const result = TestCodec.decode({ age: 'not-a-number' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors[0].code).toBe('INVALID_TYPE');
        expect(errors[0].message).toBe('Expected number but received string');
      }
    });

    it('should include suggestion for type mismatches', () => {
      const TestCodec = t.type({
        active: t.boolean,
      });

      const result = TestCodec.decode({ active: 'yes' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors[0].suggestion).toBeDefined();
        expect(errors[0].suggestion).toContain('boolean');
      }
    });
  });

  describe('error value inclusion', () => {
    it('should include the actual invalid value', () => {
      const TestCodec = t.type({
        email: Email,
      });

      const result = TestCodec.decode({ email: 'bad-email' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors[0].value).toBe('bad-email');
      }
    });

    it('should include expected type', () => {
      const TestCodec = t.type({
        email: Email,
      });

      const result = TestCodec.decode({ email: 'bad-email' });
      expect(result._tag).toBe('Left');

      if (result._tag === 'Left') {
        const errors = formatErrors(result.left);
        expect(errors[0].expected).toBe('Email');
      }
    });
  });
});
