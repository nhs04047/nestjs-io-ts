import { isLeft, isRight } from 'fp-ts/Either';

import { URL } from '../../src/extends';

describe('URL', () => {
  describe('valid URLs', () => {
    const validURLs = [
      'https://example.com',
      'http://example.com',
      'https://www.example.com',
      'https://example.com/path',
      'https://example.com/path/to/resource',
      'https://example.com/path?query=value',
      'https://example.com/path?query=value&other=test',
      'https://example.com:8080',
      'https://example.com:8080/path',
      'http://localhost:3000',
      'http://localhost:3000/api/v1',
      'https://sub.domain.example.com',
      'https://example.com/path#anchor',
      'https://user:pass@example.com',
    ];

    validURLs.forEach((url) => {
      it(`should accept: ${url}`, () => {
        expect(isRight(URL.decode(url))).toBe(true);
      });
    });
  });

  describe('invalid URLs', () => {
    const invalidURLs = [
      { value: 'not-a-url', desc: 'random string' },
      { value: '', desc: 'empty string' },
      { value: 'example.com', desc: 'missing protocol' },
      { value: 'ftp://example.com', desc: 'ftp protocol (not allowed)' },
      { value: 'file:///path/to/file', desc: 'file protocol (not allowed)' },
      { value: 'mailto:user@example.com', desc: 'mailto protocol' },
      { value: '://example.com', desc: 'missing protocol name' },
      { value: 'http://', desc: 'missing host' },
    ];

    invalidURLs.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(URL.decode(value))).toBe(true);
      });
    });

    it('should reject non-string values', () => {
      expect(isLeft(URL.decode(123))).toBe(true);
      expect(isLeft(URL.decode(null))).toBe(true);
      expect(isLeft(URL.decode(undefined))).toBe(true);
    });
  });
});
