import { HttpStatus } from '@nestjs/common';

import { IoTsValidationException } from '../src/exception';
import { ValidationError, ValidationErrorResponse } from '../src/types';

describe('IoTsValidationException', () => {
  describe('constructor with ValidationError array', () => {
    it('should create exception with structured errors', () => {
      const errors: Array<ValidationError> = [
        { field: 'email', message: 'Invalid email format', expected: 'Email' },
        { field: 'age', message: 'Expected number', expected: 'number' },
      ];

      const exception = new IoTsValidationException(errors);

      expect(exception.getErrors()).toEqual(errors);
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should format response correctly', () => {
      const errors: Array<ValidationError> = [
        { field: 'name', message: 'Required field', expected: 'string' },
      ];

      const exception = new IoTsValidationException(errors);
      const response = exception.getResponse() as ValidationErrorResponse;

      expect(response.statusCode).toBe(400);
      expect(response.message).toBe('Validation failed');
      expect(response.error).toBe('Bad Request');
      expect(response.errors).toEqual(errors);
    });
  });

  describe('constructor with string (backwards compatibility)', () => {
    it('should create exception with string message', () => {
      const exception = new IoTsValidationException('Something went wrong');

      const errors = exception.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('unknown');
      expect(errors[0].message).toBe('Something went wrong');
    });

    it('should format response correctly for string input', () => {
      const exception = new IoTsValidationException('Validation error');
      const response = exception.getResponse() as ValidationErrorResponse;

      expect(response.statusCode).toBe(400);
      expect(response.message).toBe('Validation failed');
      expect(response.errors).toHaveLength(1);
    });
  });

  describe('getErrors method', () => {
    it('should return the errors array', () => {
      const errors: Array<ValidationError> = [
        { field: 'field1', message: 'error1' },
        { field: 'field2', message: 'error2' },
      ];

      const exception = new IoTsValidationException(errors);

      expect(exception.getErrors()).toBe(errors);
      expect(exception.getErrors()).toHaveLength(2);
    });
  });

  describe('inheritance', () => {
    it('should be an instance of Error', () => {
      const exception = new IoTsValidationException([]);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const exception = new IoTsValidationException([]);
      expect(exception.name).toBe('IoTsValidationException');
    });
  });
});
