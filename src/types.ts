/**
 * Error codes for validation failures
 * @since 1.1.0
 */
export type ValidationErrorCode =
  | 'INVALID_TYPE'
  | 'INVALID_FORMAT'
  | 'INVALID_EMAIL'
  | 'INVALID_UUID'
  | 'INVALID_URL'
  | 'INVALID_PHONE'
  | 'INVALID_DATE'
  | 'INVALID_DATETIME'
  | 'INVALID_IP'
  | 'INVALID_IPV4'
  | 'INVALID_IPV6'
  | 'INVALID_INTEGER'
  | 'INVALID_POSITIVE_NUMBER'
  | 'INVALID_NON_NEGATIVE_NUMBER'
  | 'INVALID_POSITIVE_INTEGER'
  | 'INVALID_PORT'
  | 'INVALID_PERCENTAGE'
  | 'INVALID_NON_EMPTY_STRING'
  | 'INVALID_TRIMMED_STRING'
  | 'INVALID_LOWERCASE_STRING'
  | 'INVALID_UPPERCASE_STRING'
  | 'INVALID_HEX_COLOR'
  | 'INVALID_SLUG'
  | 'INVALID_BASE64'
  | 'INVALID_JWT'
  | 'REQUIRED'
  | 'UNKNOWN';

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

  /**
   * Machine-readable error code for programmatic handling
   * @since 1.1.0
   */
  code?: ValidationErrorCode;

  /**
   * Helpful suggestion for fixing the error
   * @since 1.1.0
   */
  suggestion?: string;
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
