import { isLeft, isRight } from 'fp-ts/Either';

import {
  Base64,
  HexColor,
  JWT,
  LowercaseString,
  NonEmptyString,
  Slug,
  TrimmedString,
  UppercaseString,
} from '../../src/extends';

describe('NonEmptyString', () => {
  it('should accept non-empty strings', () => {
    expect(isRight(NonEmptyString.decode('hello'))).toBe(true);
    expect(isRight(NonEmptyString.decode('a'))).toBe(true);
    expect(isRight(NonEmptyString.decode(' '))).toBe(true);
    expect(isRight(NonEmptyString.decode('  spaces  '))).toBe(true);
  });

  it('should reject empty strings', () => {
    expect(isLeft(NonEmptyString.decode(''))).toBe(true);
  });

  it('should reject non-string values', () => {
    expect(isLeft(NonEmptyString.decode(null))).toBe(true);
    expect(isLeft(NonEmptyString.decode(undefined))).toBe(true);
    expect(isLeft(NonEmptyString.decode(123))).toBe(true);
  });
});

describe('TrimmedString', () => {
  it('should accept trimmed strings', () => {
    expect(isRight(TrimmedString.decode('hello'))).toBe(true);
    expect(isRight(TrimmedString.decode('hello world'))).toBe(true);
    expect(isRight(TrimmedString.decode(''))).toBe(true);
  });

  it('should reject strings with leading/trailing whitespace', () => {
    expect(isLeft(TrimmedString.decode(' hello'))).toBe(true);
    expect(isLeft(TrimmedString.decode('hello '))).toBe(true);
    expect(isLeft(TrimmedString.decode(' hello '))).toBe(true);
    expect(isLeft(TrimmedString.decode('\thello'))).toBe(true);
    expect(isLeft(TrimmedString.decode('hello\n'))).toBe(true);
  });
});

describe('LowercaseString', () => {
  it('should accept lowercase strings', () => {
    expect(isRight(LowercaseString.decode('hello'))).toBe(true);
    expect(isRight(LowercaseString.decode('hello world'))).toBe(true);
    expect(isRight(LowercaseString.decode('123'))).toBe(true);
    expect(isRight(LowercaseString.decode(''))).toBe(true);
    expect(isRight(LowercaseString.decode('hello123'))).toBe(true);
  });

  it('should reject strings with uppercase characters', () => {
    expect(isLeft(LowercaseString.decode('Hello'))).toBe(true);
    expect(isLeft(LowercaseString.decode('HELLO'))).toBe(true);
    expect(isLeft(LowercaseString.decode('helloWorld'))).toBe(true);
  });
});

describe('UppercaseString', () => {
  it('should accept uppercase strings', () => {
    expect(isRight(UppercaseString.decode('HELLO'))).toBe(true);
    expect(isRight(UppercaseString.decode('HELLO WORLD'))).toBe(true);
    expect(isRight(UppercaseString.decode('123'))).toBe(true);
    expect(isRight(UppercaseString.decode(''))).toBe(true);
    expect(isRight(UppercaseString.decode('HELLO123'))).toBe(true);
  });

  it('should reject strings with lowercase characters', () => {
    expect(isLeft(UppercaseString.decode('Hello'))).toBe(true);
    expect(isLeft(UppercaseString.decode('hello'))).toBe(true);
    expect(isLeft(UppercaseString.decode('HELLOworld'))).toBe(true);
  });
});

describe('HexColor', () => {
  describe('valid hex colors', () => {
    const validColors = [
      '#fff',
      '#FFF',
      '#ffffff',
      '#FFFFFF',
      '#000',
      '#000000',
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffff', // 4-digit with alpha
      '#ffffffff', // 8-digit with alpha
      '#ff000080', // semi-transparent red
    ];

    validColors.forEach((color) => {
      it(`should accept: ${color}`, () => {
        expect(isRight(HexColor.decode(color))).toBe(true);
      });
    });
  });

  describe('invalid hex colors', () => {
    const invalidColors = [
      { value: 'fff', desc: 'missing #' },
      { value: '#ff', desc: 'too short' },
      { value: '#fffff', desc: 'invalid length (5)' },
      { value: '#fffffff', desc: 'invalid length (7)' },
      { value: '#gggggg', desc: 'invalid hex characters' },
      { value: 'rgb(255,0,0)', desc: 'rgb format' },
      { value: '', desc: 'empty string' },
    ];

    invalidColors.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(HexColor.decode(value))).toBe(true);
      });
    });
  });
});

describe('Slug', () => {
  describe('valid slugs', () => {
    const validSlugs = [
      'hello',
      'hello-world',
      'my-blog-post-123',
      'a',
      '123',
      'post-1',
      'my-very-long-slug-with-many-words',
    ];

    validSlugs.forEach((slug) => {
      it(`should accept: ${slug}`, () => {
        expect(isRight(Slug.decode(slug))).toBe(true);
      });
    });
  });

  describe('invalid slugs', () => {
    const invalidSlugs = [
      { value: 'Hello', desc: 'uppercase letters' },
      { value: 'hello world', desc: 'spaces' },
      { value: 'hello_world', desc: 'underscores' },
      { value: '-hello', desc: 'starts with hyphen' },
      { value: 'hello-', desc: 'ends with hyphen' },
      { value: 'hello--world', desc: 'consecutive hyphens' },
      { value: '', desc: 'empty string' },
      { value: 'hello.world', desc: 'dots' },
    ];

    invalidSlugs.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(Slug.decode(value))).toBe(true);
      });
    });
  });
});

describe('Base64', () => {
  it('should accept valid base64 strings', () => {
    expect(isRight(Base64.decode('SGVsbG8gV29ybGQ='))).toBe(true);
    expect(isRight(Base64.decode('dGVzdA=='))).toBe(true);
    expect(isRight(Base64.decode('YQ=='))).toBe(true);
    expect(isRight(Base64.decode(''))).toBe(true);
  });

  it('should reject invalid base64 strings', () => {
    expect(isLeft(Base64.decode('not-base64!'))).toBe(true);
    expect(isLeft(Base64.decode('hello world'))).toBe(true);
    expect(isLeft(Base64.decode('==='))).toBe(true);
  });
});

describe('JWT', () => {
  const validJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('should accept valid JWT format', () => {
    expect(isRight(JWT.decode(validJWT))).toBe(true);
  });

  it('should accept JWT with empty signature', () => {
    expect(
      isRight(
        JWT.decode(
          'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.',
        ),
      ),
    ).toBe(true);
  });

  it('should reject invalid JWT formats', () => {
    expect(isLeft(JWT.decode('not.a.valid.jwt'))).toBe(true);
    expect(isLeft(JWT.decode('only-one-part'))).toBe(true);
    expect(isLeft(JWT.decode('two.parts'))).toBe(true);
    expect(isLeft(JWT.decode(''))).toBe(true);
  });
});
