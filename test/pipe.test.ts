import { ArgumentMetadata } from '@nestjs/common';
import * as t from 'io-ts';

import { createIoTsDto } from '../src/dto';
import { IoTsValidationException } from '../src/exception';
import { IoTsValidationPipe } from '../src/pipe';

describe('IoTsValidationPipe', () => {
  const UserCodec = t.type({
    id: t.string,
    password: t.string,
  });

  // Use createIoTsDto directly without extending
  const UserDto = createIoTsDto(UserCodec);

  describe('explicit codec/DTO validation', () => {
    it('should validate with manually passed codec', () => {
      const pipe = new IoTsValidationPipe(UserCodec);

      const valid = { id: 'vasya', password: '123' };
      const metadata: ArgumentMetadata = { type: 'body' };

      expect(pipe.transform(valid, metadata)).toEqual(valid);
    });

    it('should validate with manually passed DTO', () => {
      const pipe = new IoTsValidationPipe(UserDto);

      const valid = { id: 'vasya', password: '123' };
      const metadata: ArgumentMetadata = { type: 'body' };

      expect(pipe.transform(valid, metadata)).toEqual(valid);
    });

    it('should throw IoTsValidationException for invalid data', () => {
      const pipe = new IoTsValidationPipe(UserCodec);

      const invalid = { id: 'vasya', password: 123 };
      const metadata: ArgumentMetadata = { type: 'body' };

      expect(() => pipe.transform(invalid, metadata)).toThrow(
        IoTsValidationException,
      );
    });
  });

  describe('contextual DTO validation', () => {
    it('should use contextual DTO from metadata for validation', () => {
      const pipe = new IoTsValidationPipe();

      const valid = { id: 'vasya', password: '123' };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: UserDto,
      };

      expect(pipe.transform(valid, metadata)).toEqual(valid);
    });

    it('should throw IoTsValidationException for invalid data with contextual DTO', () => {
      const pipe = new IoTsValidationPipe();

      const invalid = { id: 'vasya', password: 123 };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: UserDto,
      };

      expect(() => pipe.transform(invalid, metadata)).toThrow(
        IoTsValidationException,
      );
    });
  });

  describe('passthrough behavior', () => {
    it('should pass through primitive types', () => {
      const pipe = new IoTsValidationPipe();

      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: String,
      };

      expect(pipe.transform('test', metadata)).toBe('test');
    });

    it('should pass through when metatype is undefined', () => {
      const pipe = new IoTsValidationPipe();

      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: undefined,
      };

      expect(pipe.transform({ any: 'data' }, metadata)).toEqual({
        any: 'data',
      });
    });

    it('should pass through non-IoTsDto classes with allowPassthrough option', () => {
      const pipe = new IoTsValidationPipe({ allowPassthrough: true });

      class RegularDto {}
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: RegularDto,
      };

      expect(pipe.transform({ any: 'data' }, metadata)).toEqual({
        any: 'data',
      });
    });

    it('should warn but pass through non-IoTsDto classes without allowPassthrough', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const pipe = new IoTsValidationPipe();

      class RegularDto {}
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: RegularDto,
      };

      const result = pipe.transform({ any: 'data' }, metadata);
      expect(result).toEqual({ any: 'data' });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('validateTypes option', () => {
    it('should only validate specified argument types', () => {
      const pipe = new IoTsValidationPipe(UserCodec, {
        validateTypes: ['body'],
      });

      const invalid = { id: 123, password: 456 };

      // Should validate body
      expect(() => pipe.transform(invalid, { type: 'body' })).toThrow(
        IoTsValidationException,
      );

      // Should skip query (not in validateTypes)
      expect(pipe.transform(invalid, { type: 'query' })).toEqual(invalid);
    });

    it('should skip validation for non-matching argument types', () => {
      const pipe = new IoTsValidationPipe(UserCodec, {
        validateTypes: ['body'],
      });

      const invalid = { id: 123, password: 456 };

      // Query should pass through without validation
      expect(pipe.transform(invalid, { type: 'query' })).toEqual(invalid);
      expect(pipe.transform(invalid, { type: 'param' })).toEqual(invalid);
    });
  });

  describe('error response format', () => {
    it('should provide structured error response', () => {
      const pipe = new IoTsValidationPipe(UserCodec);

      const invalid = { id: 123, password: 'valid' };
      const metadata: ArgumentMetadata = { type: 'body' };

      try {
        pipe.transform(invalid, metadata);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(IoTsValidationException);
        const exception = error as IoTsValidationException;

        const response = exception.getResponse() as Record<string, unknown>;
        expect(response.statusCode).toBe(400);
        expect(response.message).toBe('Validation failed');
        expect(response.error).toBe('Bad Request');
        expect(Array.isArray(response.errors)).toBe(true);
      }
    });

    it('should include field-level error details', () => {
      const pipe = new IoTsValidationPipe(UserCodec);

      const invalid = { id: 123, password: 'valid' };
      const metadata: ArgumentMetadata = { type: 'body' };

      try {
        pipe.transform(invalid, metadata);
        fail('Should have thrown');
      } catch (error) {
        const exception = error as IoTsValidationException;
        const errors = exception.getErrors();

        expect(errors.length).toBeGreaterThan(0);
        const idError = errors.find((e) => e.field === 'id');
        expect(idError).toBeDefined();
        expect(idError?.expected).toBe('string');
      }
    });
  });

  describe('constructor options', () => {
    it('should accept options as first parameter', () => {
      const pipe = new IoTsValidationPipe({ allowPassthrough: true });

      class RegularDto {}
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: RegularDto,
      };

      // Should not warn when allowPassthrough is true
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      pipe.transform({ any: 'data' }, metadata);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should accept codec and options together', () => {
      const pipe = new IoTsValidationPipe(UserCodec, {
        validateTypes: ['body'],
      });

      const valid = { id: 'test', password: 'pass' };

      // Should validate body
      expect(pipe.transform(valid, { type: 'body' })).toEqual(valid);

      // Should skip param
      const invalid = { id: 123, password: 456 };
      expect(pipe.transform(invalid, { type: 'param' })).toEqual(invalid);
    });
  });
});
