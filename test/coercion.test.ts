import * as t from 'io-ts';

import { createIoTsDto, IoTsValidationPipe } from '../src';

describe('Query String Coercion', () => {
  const PaginationCodec = t.type({
    page: t.number,
    limit: t.number,
    active: t.boolean,
  });

  const PaginationDto = createIoTsDto(PaginationCodec);

  describe('coerceQueryStrings option', () => {
    it('should coerce string numbers to numbers when enabled', () => {
      const pipe = new IoTsValidationPipe(PaginationDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        { page: '1', limit: '10', active: 'true' },
        { type: 'query', metatype: PaginationDto },
      );

      expect(result).toEqual({
        page: 1,
        limit: 10,
        active: true,
      });
    });

    it('should coerce boolean strings to booleans', () => {
      const pipe = new IoTsValidationPipe(PaginationDto, {
        coerceQueryStrings: true,
      });

      const resultTrue = pipe.transform(
        { page: '1', limit: '10', active: 'true' },
        { type: 'query', metatype: PaginationDto },
      ) as { page: number; limit: number; active: boolean };
      expect(resultTrue.active).toBe(true);

      const resultFalse = pipe.transform(
        { page: '1', limit: '10', active: 'false' },
        { type: 'query', metatype: PaginationDto },
      ) as { page: number; limit: number; active: boolean };
      expect(resultFalse.active).toBe(false);
    });

    it('should not coerce when option is disabled', () => {
      const pipe = new IoTsValidationPipe(PaginationDto, {
        coerceQueryStrings: false,
      });

      expect(() => {
        pipe.transform(
          { page: '1', limit: '10', active: 'true' },
          { type: 'query', metatype: PaginationDto },
        );
      }).toThrow();
    });

    it('should only coerce for query and param types', () => {
      const pipe = new IoTsValidationPipe(PaginationDto, {
        coerceQueryStrings: true,
      });

      // Body should not be coerced
      expect(() => {
        pipe.transform(
          { page: '1', limit: '10', active: 'true' },
          { type: 'body', metatype: PaginationDto },
        );
      }).toThrow();

      // Query should be coerced
      const queryResult = pipe.transform(
        { page: '1', limit: '10', active: 'true' },
        { type: 'query', metatype: PaginationDto },
      ) as { page: number; limit: number; active: boolean };
      expect(queryResult.page).toBe(1);

      // Param should be coerced
      const paramResult = pipe.transform(
        { page: '1', limit: '10', active: 'true' },
        { type: 'param', metatype: PaginationDto },
      ) as { page: number; limit: number; active: boolean };
      expect(paramResult.page).toBe(1);
    });
  });

  describe('coercion edge cases', () => {
    it('should handle null and undefined strings', () => {
      const OptionalCodec = t.partial({
        value: t.union([t.string, t.null, t.undefined]),
      });
      const OptionalDto = createIoTsDto(OptionalCodec);

      const pipe = new IoTsValidationPipe(OptionalDto, {
        coerceQueryStrings: true,
      });

      const nullResult = pipe.transform(
        { value: 'null' },
        { type: 'query', metatype: OptionalDto },
      ) as { value?: string | null | undefined };
      expect(nullResult.value).toBe(null);

      const undefinedResult = pipe.transform(
        { value: 'undefined' },
        { type: 'query', metatype: OptionalDto },
      ) as { value?: string | null | undefined };
      expect(undefinedResult.value).toBe(undefined);
    });

    it('should handle float numbers', () => {
      const FloatCodec = t.type({
        price: t.number,
      });
      const FloatDto = createIoTsDto(FloatCodec);

      const pipe = new IoTsValidationPipe(FloatDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        { price: '19.99' },
        { type: 'query', metatype: FloatDto },
      ) as { price: number };
      expect(result.price).toBe(19.99);
    });

    it('should handle negative numbers', () => {
      const SignedCodec = t.type({
        offset: t.number,
      });
      const SignedDto = createIoTsDto(SignedCodec);

      const pipe = new IoTsValidationPipe(SignedDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        { offset: '-10' },
        { type: 'query', metatype: SignedDto },
      ) as { offset: number };
      expect(result.offset).toBe(-10);
    });

    it('should not coerce empty strings to numbers', () => {
      const StringCodec = t.type({
        name: t.string,
      });
      const StringDto = createIoTsDto(StringCodec);

      const pipe = new IoTsValidationPipe(StringDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        { name: '' },
        { type: 'query', metatype: StringDto },
      ) as { name: string };
      expect(result.name).toBe('');
    });

    it('should handle nested objects', () => {
      const NestedCodec = t.type({
        filter: t.type({
          minAge: t.number,
          maxAge: t.number,
          active: t.boolean,
        }),
      });
      const NestedDto = createIoTsDto(NestedCodec);

      const pipe = new IoTsValidationPipe(NestedDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        {
          filter: {
            minAge: '18',
            maxAge: '65',
            active: 'true',
          },
        },
        { type: 'query', metatype: NestedDto },
      ) as { filter: { minAge: number; maxAge: number; active: boolean } };

      expect(result.filter.minAge).toBe(18);
      expect(result.filter.maxAge).toBe(65);
      expect(result.filter.active).toBe(true);
    });

    it('should handle arrays', () => {
      const ArrayCodec = t.type({
        ids: t.array(t.number),
      });
      const ArrayDto = createIoTsDto(ArrayCodec);

      const pipe = new IoTsValidationPipe(ArrayDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        { ids: ['1', '2', '3'] },
        { type: 'query', metatype: ArrayDto },
      ) as { ids: Array<number> };

      expect(result.ids).toEqual([1, 2, 3]);
    });
  });

  describe('preserving non-string values', () => {
    it('should not modify already correct types', () => {
      const pipe = new IoTsValidationPipe(PaginationDto, {
        coerceQueryStrings: true,
      });

      const result = pipe.transform(
        { page: 1, limit: 10, active: true },
        { type: 'query', metatype: PaginationDto },
      );

      expect(result).toEqual({
        page: 1,
        limit: 10,
        active: true,
      });
    });
  });
});
