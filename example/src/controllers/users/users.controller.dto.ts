import * as t from 'io-ts';
import { createIoTsDto } from '../../../../src/dto';

const CreateUserDtoC = t.type({
  id: t.string,
  name: t.string,
  email: t.string,
  age: t.union([t.number, t.undefined]), // Optional field
});

export class CreateUserDto extends createIoTsDto(CreateUserDtoC) {}
