/**
 * Represents a single field validation error
 * @since 1.0.0
 */
export interface ValidationError {
  /**
   * The path to the field that failed validation
   * @example "email", "user.address.city"
   */
  field: string;

  /**
   * Human-readable error message describing the validation failure
   */
  message: string;

  /**
   * The actual value that was received (optional for security reasons)
   */
  value?: unknown;

  /**
   * The expected type or constraint
   */
  expected?: string;
}

/**
 * Structured validation error response following NestJS conventions
 * @since 1.0.0
 */
export interface ValidationErrorResponse {
  /**
   * HTTP status code (400 for validation errors)
   */
  statusCode: number;

  /**
   * Summary error message
   */
  message: string;

  /**
   * Error type identifier
   */
  error: string;

  /**
   * Detailed list of validation errors per field
   */
  errors: Array<ValidationError>;
}
