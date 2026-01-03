import { BadRequestException, HttpStatus } from '@nestjs/common';

import { ValidationError, ValidationErrorResponse } from './types';

/**
 * Custom exception for io-ts validation failures
 * Extends NestJS BadRequestException with structured error details
 *
 * @example
 * ```typescript
 * throw new IoTsValidationException([
 *   { field: 'email', message: 'Invalid email format', expected: 'Email' }
 * ]);
 * ```
 *
 * @since 1.0.0
 */
export class IoTsValidationException extends BadRequestException {
  /**
   * The list of validation errors
   */
  public readonly errors: Array<ValidationError>;

  /**
   * Creates a new IoTsValidationException
   * @param errors - Array of validation errors, or a single error message string for backwards compatibility
   */
  constructor(errors: Array<ValidationError> | string) {
    const errorList: Array<ValidationError> =
      typeof errors === 'string'
        ? [{ field: 'unknown', message: errors }]
        : errors;

    const response: ValidationErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      error: 'Bad Request',
      errors: errorList,
    };

    super(response);
    this.errors = errorList;
  }

  /**
   * Get the validation errors
   */
  getErrors(): Array<ValidationError> {
    return this.errors;
  }
}
