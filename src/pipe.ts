import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Type } from 'io-ts';

import { IoTsDto } from './dto';
import { decodeAndThrow } from './validate';

@Injectable()
export class IoTsValidationPipe<A, O, I> implements PipeTransform {
  constructor(private readonly codecOrDto?: Type<A, O, I> | IoTsDto<A, O, I>) {}

  public transform(value: I, metadata: ArgumentMetadata) {
    if (this.codecOrDto) {
      return decodeAndThrow(value, this.codecOrDto);
    }

    const { metatype } = metadata;

    const isIoTsDto = (obj: any): obj is IoTsDto<A, O, I> => {
      return 'codec' in obj;
    };

    if (!isIoTsDto(metatype)) {
      return value;
    }

    return decodeAndThrow(value, metatype.codec);
  }
}
