import { ArgumentMetadata } from '@nestjs/common';
import * as t from 'io-ts';

import { createIoTsDto } from '../src/dto';
import { IoTsValidationException } from '../src/exception';
import { IoTsValidationPipe } from '../src/pipe';

describe('IoTsValidationPipe test suit', () => {
  const UserCodec = t.type({
    id: t.string,
    password: t.string,
  });

  const UserDto = class UserDto extends createIoTsDto(UserCodec) {};

  it('should use manually passed Schema / DTO for validation', () => {
    for (const codecOrDto of [UserCodec, UserDto]) {
      const pipe = new IoTsValidationPipe(codecOrDto);

      const valid = {
        id: 'vasya',
        password: '123',
      };

      const invalid = {
        id: 'vasya',
        password: 123,
      };

      const metadata: ArgumentMetadata = {
        type: 'body',
      };

      expect(pipe.transform(valid, metadata)).toEqual(valid);
      expect(() => pipe.transform(invalid, metadata)).toThrow();
    }
  });

  it('should use contextual Dto for validation', () => {
    const pipe = new IoTsValidationPipe();

    const valid = {
      id: 'vasya',
      password: '123',
    };

    const invalid = {
      id: 'vasya',
      password: 123,
    };

    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: class Dto extends createIoTsDto(UserCodec) {},
    };

    expect(pipe.transform(valid, metadata)).toEqual(valid);
    expect(() => pipe.transform(invalid, metadata)).toThrow(
      IoTsValidationException,
    );
  });
});
