import * as t from 'io-ts';
import { createIoTsDto, Email } from 'nestjs-io-ts';

const CreateUserDtoC = t.type({
  id: t.string,
  name: t.string,
  email: Email,
  age: t.union([t.number, t.undefined]),
});

export class CreateUserDto extends createIoTsDto(CreateUserDtoC) {}
