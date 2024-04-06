import * as t from 'io-ts';
import { formatValidationErrors } from 'io-ts-reporters';

import { IoTsDto } from './dto';
import { IoTsValidationException } from './exception';

export function decodeAndThrow<A, O, I>(
  value: I,
  codecOrDto: t.Type<A, O, I> | IoTsDto<A, O, I>,
) {
  const isIoTsDto = (obj: any): obj is IoTsDto<A, O, I> => {
    return 'codec' in obj;
  };

  const codec = isIoTsDto(codecOrDto) ? codecOrDto.codec : codecOrDto;

  const decodedValue = codec.decode(value);
  if (decodedValue._tag === 'Left') {
    throw new IoTsValidationException(
      formatValidationErrors(decodedValue.left).join(', '),
    );
  }
  return decodedValue.right;
}
