import * as t from 'io-ts';

import { createIoTsDto, IO_TS_DTO_SYMBOL, isIoTsDto } from '../src/dto';
import { IoTsValidationException } from '../src/exception';

describe('createIoTsDto', () => {
  const UserCodec = t.type({
    id: t.string,
    password: t.string,
  });

  it('should correctly create DTO with codec', () => {
    class UserDto extends createIoTsDto(UserCodec) {}

    expect(UserDto.codec).toBe(UserCodec);
    expect(UserDto[IO_TS_DTO_SYMBOL]).toBe(true);
  });

  it('should create valid data using create() method', () => {
    class UserDto extends createIoTsDto(UserCodec) {}

    const user = UserDto.create({
      id: 'hello',
      password: 'world',
    });

    expect(user).toEqual({
      id: 'hello',
      password: 'world',
    });
  });

  it('should throw IoTsValidationException for invalid data in create()', () => {
    class UserDto extends createIoTsDto(UserCodec) {}

    expect(() => {
      UserDto.create({
        id: 'hello',
        password: 123, // invalid type
      } as unknown);
    }).toThrow(IoTsValidationException);
  });

  it('should provide structured error details on validation failure', () => {
    class UserDto extends createIoTsDto(UserCodec) {}

    try {
      UserDto.create({
        id: 123, // invalid type
        password: null, // invalid type
      } as unknown);
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(IoTsValidationException);
      const exception = error as IoTsValidationException;
      const errors = exception.getErrors();

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === 'id')).toBe(true);
    }
  });

  it('should throw error for invalid codec', () => {
    expect(() => {
      createIoTsDto(null as unknown as t.Type<unknown>);
    }).toThrow('Invalid codec');

    expect(() => {
      createIoTsDto({} as unknown as t.Type<unknown>);
    }).toThrow('Invalid codec');
  });

  it('should handle nested objects', () => {
    const AddressCodec = t.type({
      street: t.string,
      city: t.string,
    });

    const PersonCodec = t.type({
      name: t.string,
      address: AddressCodec,
    });

    class PersonDto extends createIoTsDto(PersonCodec) {}

    const person = PersonDto.create({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Seoul',
      },
    });

    expect(person).toEqual({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Seoul',
      },
    });
  });

  it('should handle optional fields with union types', () => {
    const OptionalCodec = t.type({
      required: t.string,
      optional: t.union([t.string, t.undefined]),
    });

    class OptionalDto extends createIoTsDto(OptionalCodec) {}

    // With optional field
    const withOptional = OptionalDto.create({
      required: 'test',
      optional: 'value',
    });
    expect(withOptional).toEqual({
      required: 'test',
      optional: 'value',
    });

    // Without optional field
    const withoutOptional = OptionalDto.create({
      required: 'test',
      optional: undefined,
    });
    expect(withoutOptional).toEqual({
      required: 'test',
      optional: undefined,
    });
  });
});

describe('isIoTsDto', () => {
  it('should return true for valid IoTsDto classes', () => {
    const TestCodec = t.type({ name: t.string });
    class TestDto extends createIoTsDto(TestCodec) {}

    expect(isIoTsDto(TestDto)).toBe(true);
  });

  it('should return false for non-IoTsDto objects', () => {
    expect(isIoTsDto(null)).toBe(false);
    expect(isIoTsDto(undefined)).toBe(false);
    expect(isIoTsDto({})).toBe(false);
    expect(isIoTsDto({ codec: {} })).toBe(false);
    expect(isIoTsDto(class RegularClass {})).toBe(false);
  });

  it('should return false for objects with only codec property', () => {
    const fakeDto = { codec: t.string };
    expect(isIoTsDto(fakeDto)).toBe(false);
  });
});
