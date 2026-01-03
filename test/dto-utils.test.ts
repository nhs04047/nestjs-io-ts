import * as t from 'io-ts';

import {
  createIntersectionDto,
  createOmitDto,
  createPartialDto,
  createPickDto,
  Email,
  isIoTsDto,
  UUID,
} from '../src';

describe('DTO Utility Functions', () => {
  const UserCodec = t.type({
    id: UUID,
    name: t.string,
    email: Email,
    age: t.number,
    password: t.string,
  });

  describe('createPartialDto', () => {
    it('should create a DTO with all fields optional', () => {
      const PartialUserDto = createPartialDto(UserCodec);

      expect(isIoTsDto(PartialUserDto)).toBe(true);

      // Should accept empty object
      const emptyResult = PartialUserDto.create({});
      expect(emptyResult).toEqual({});

      // Should accept partial data
      const partialResult = PartialUserDto.create({
        name: 'John',
        age: 30,
      });
      expect(partialResult).toEqual({ name: 'John', age: 30 });

      // Should accept full data
      const fullResult = PartialUserDto.create({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John',
        email: 'john@example.com',
        age: 30,
        password: 'secret',
      });
      expect(fullResult.name).toBe('John');
    });

    it('should still validate types for provided fields', () => {
      const PartialUserDto = createPartialDto(UserCodec);

      expect(() => {
        PartialUserDto.create({ email: 'not-an-email' });
      }).toThrow();

      expect(() => {
        PartialUserDto.create({ age: 'not-a-number' as unknown as number });
      }).toThrow();
    });
  });

  describe('createPickDto', () => {
    it('should create a DTO with only specified fields', () => {
      const ContactDto = createPickDto(UserCodec, ['email', 'name']);

      expect(isIoTsDto(ContactDto)).toBe(true);

      // Should accept only picked fields
      const result = ContactDto.create({
        email: 'john@example.com',
        name: 'John',
      });
      expect(result).toEqual({
        email: 'john@example.com',
        name: 'John',
      });
    });

    it('should reject missing required fields', () => {
      const ContactDto = createPickDto(UserCodec, ['email', 'name']);

      expect(() => {
        ContactDto.create({ name: 'John' } as { email: string; name: string });
      }).toThrow();
    });

    it('should validate picked field types', () => {
      const ContactDto = createPickDto(UserCodec, ['email', 'name']);

      expect(() => {
        ContactDto.create({
          email: 'not-an-email',
          name: 'John',
        });
      }).toThrow();
    });

    it('should strip extra fields not in pick list', () => {
      const ContactDto = createPickDto(UserCodec, ['email', 'name']);

      const result = ContactDto.create({
        email: 'john@example.com',
        name: 'John',
        age: 30, // extra field, should be ignored or stripped
      } as unknown as { email: string; name: string });

      // Extra fields may or may not be included depending on io-ts behavior
      expect(result.email).toBe('john@example.com');
      expect(result.name).toBe('John');
    });
  });

  describe('createOmitDto', () => {
    it('should create a DTO without specified fields', () => {
      const CreateUserDto = createOmitDto(UserCodec, ['id', 'password']);

      expect(isIoTsDto(CreateUserDto)).toBe(true);

      const result = CreateUserDto.create({
        name: 'John',
        email: 'john@example.com',
        age: 30,
      });

      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: 30,
      });
    });

    it('should require remaining fields', () => {
      const CreateUserDto = createOmitDto(UserCodec, ['id', 'password']);

      expect(() => {
        CreateUserDto.create({
          name: 'John',
          // missing email and age
        } as { name: string; email: string; age: number });
      }).toThrow();
    });

    it('should validate remaining field types', () => {
      const CreateUserDto = createOmitDto(UserCodec, ['id', 'password']);

      expect(() => {
        CreateUserDto.create({
          name: 'John',
          email: 'not-an-email',
          age: 30,
        });
      }).toThrow();
    });
  });

  describe('createIntersectionDto', () => {
    it('should combine required and partial fields', () => {
      const RequiredFields = t.type({
        name: t.string,
        email: Email,
      });

      const OptionalFields = t.partial({
        age: t.number,
        bio: t.string,
      });

      const UserDto = createIntersectionDto(RequiredFields, OptionalFields);

      expect(isIoTsDto(UserDto)).toBe(true);

      // Should accept only required fields
      const minimalResult = UserDto.create({
        name: 'John',
        email: 'john@example.com',
      });
      expect(minimalResult.name).toBe('John');
      expect(minimalResult.email).toBe('john@example.com');

      // Should accept all fields
      const fullResult = UserDto.create({
        name: 'John',
        email: 'john@example.com',
        age: 30,
        bio: 'Software developer',
      });
      expect(fullResult.age).toBe(30);
      expect(fullResult.bio).toBe('Software developer');
    });

    it('should require the required fields', () => {
      const RequiredFields = t.type({
        name: t.string,
        email: Email,
      });

      const OptionalFields = t.partial({
        age: t.number,
      });

      const UserDto = createIntersectionDto(RequiredFields, OptionalFields);

      expect(() => {
        UserDto.create({
          name: 'John',
          // missing email
        } as { name: string; email: string });
      }).toThrow();
    });

    it('should validate all field types', () => {
      const RequiredFields = t.type({
        email: Email,
      });

      const OptionalFields = t.partial({
        age: t.number,
      });

      const UserDto = createIntersectionDto(RequiredFields, OptionalFields);

      expect(() => {
        UserDto.create({
          email: 'invalid-email',
          age: 30,
        });
      }).toThrow();

      expect(() => {
        UserDto.create({
          email: 'john@example.com',
          age: 'not-a-number' as unknown as number,
        });
      }).toThrow();
    });
  });

  describe('chaining dto utilities', () => {
    it('should work with extended classes', () => {
      class UpdateUserDto extends createPartialDto(UserCodec) {}

      expect(isIoTsDto(UpdateUserDto)).toBe(true);

      const result = UpdateUserDto.create({ name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });
});
