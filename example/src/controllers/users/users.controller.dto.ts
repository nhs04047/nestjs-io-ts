import * as t from 'io-ts';
import * as a from 'nestjs-io-ts';

const CreateUserDtoC = t.type({
  id: t.string,
  name: t.string,
  email: t.string,
  age: t.union([t.number, t.undefined]),
});

export class CreateUserDto extends createIoTsDto(CreateUserDtoC) {}
