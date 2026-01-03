import { isLeft, isRight } from 'fp-ts/Either';

import { UUID } from '../../src/extends';

describe('UUID', () => {
  describe('valid UUIDs', () => {
    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000', // v1
      '550e8400-e29b-41d4-a716-446655440000', // v4
      'f47ac10b-58cc-4372-a567-0e02b2c3d479', // v4
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // v1
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // v4
    ];

    validUUIDs.forEach((uuid) => {
      it(`should accept: ${uuid}`, () => {
        expect(isRight(UUID.decode(uuid))).toBe(true);
      });
    });

    it('should accept UUIDs in uppercase', () => {
      expect(isRight(UUID.decode('123E4567-E89B-12D3-A456-426614174000'))).toBe(
        true,
      );
    });
  });

  describe('invalid UUIDs', () => {
    const invalidUUIDs = [
      { value: 'not-a-uuid', desc: 'random string' },
      { value: '', desc: 'empty string' },
      { value: '123e4567-e89b-12d3-a456', desc: 'too short' },
      {
        value: '123e4567-e89b-12d3-a456-426614174000-extra',
        desc: 'too long',
      },
      {
        value: '123e4567e89b12d3a456426614174000',
        desc: 'missing hyphens',
      },
      {
        value: '123e4567-e89b-02d3-a456-426614174000',
        desc: 'invalid version (0)',
      },
      {
        value: '123e4567-e89b-12d3-0456-426614174000',
        desc: 'invalid variant',
      },
      {
        value: 'gggggggg-gggg-1ggg-aggg-gggggggggggg',
        desc: 'invalid hex characters',
      },
    ];

    invalidUUIDs.forEach(({ value, desc }) => {
      it(`should reject: ${desc}`, () => {
        expect(isLeft(UUID.decode(value))).toBe(true);
      });
    });

    it('should reject non-string values', () => {
      expect(isLeft(UUID.decode(123))).toBe(true);
      expect(isLeft(UUID.decode(null))).toBe(true);
      expect(isLeft(UUID.decode(undefined))).toBe(true);
    });
  });
});
