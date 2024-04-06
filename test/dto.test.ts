import * as t from 'io-ts';

import { createIoTsDto } from '../src/dto';

describe('create IoTsDto test suit', () => {
  it('should correctly create DTO', () => {
    const UserCodec = t.type({
      id: t.string,
      password: t.string,
    });

    class UserDto extends createIoTsDto(UserCodec) {}

    expect(UserDto.codec).toBe(UserCodec);

    const user = UserDto.create({
      id: 'hello',
      password: 'world',
    });

    expect(user).toEqual({
      id: 'hello',
      password: 'world',
    });
  });
});
