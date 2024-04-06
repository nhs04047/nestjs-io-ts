import * as t from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

export const a = NonEmptyString;

export interface IoTsDto<A, O, I> {
  new ();
  codec: t.Type<A, O, I>;
  create(input: I): A;
}

export function createIoTsDto<A, O, I>(
  codec: t.Type<A, O, I>,
): IoTsDto<A, O, I> {
  class AugmentedIoTsDto {
    public static codec = codec;

    public static create(input: I) {
      const decodedInput = this.codec.decode(input);
      if (decodedInput._tag === 'Left') {
        throw new Error('Invalid data format for DTO');
      }
      return decodedInput.right;
    }
  }
  return AugmentedIoTsDto;
}
