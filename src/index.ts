/**
 * nestjs-io-ts - io-ts integration for NestJS
 *
 * Provides runtime type validation using io-ts with NestJS pipes and DTOs.
 *
 * @packageDocumentation
 * @module nestjs-io-ts
 * @since 1.0.0
 */

// ============================================================================
// Core DTO and Pipe
// ============================================================================

export type { IoTsDto } from './dto';
export { createIoTsDto, isIoTsDto, IO_TS_DTO_SYMBOL } from './dto';
export {
  createPartialDto,
  createPickDto,
  createOmitDto,
  createIntersectionDto,
} from './dto-utils';
export { IoTsValidationPipe } from './pipe';
export type { IoTsValidationPipeOptions } from './pipe';

// ============================================================================
// Exception and Error Types
// ============================================================================

export { IoTsValidationException } from './exception';
export type {
  ValidationError,
  ValidationErrorCode,
  ValidationErrorResponse,
} from './types';

// ============================================================================
// Validation Utilities
// ============================================================================

export { decodeAndThrow, formatErrors } from './validate';
export { withMessage } from './with-message';
export type { CustomErrorMessages } from './with-message';

// ============================================================================
// Codec Combinators
// ============================================================================

export {
  nullable,
  optional,
  withDefault,
  crossValidate,
  transform,
} from './combinators';
export type {
  CrossValidationError,
  CrossValidator,
  Transformer,
} from './combinators';

// ============================================================================
// OpenAPI Integration
// ============================================================================

export { ioTsToOpenAPI } from './io-ts-to-openapi';
export type { SchemaOrReferenceObject } from './io-ts-to-openapi';

// ============================================================================
// Extended Types (Branded Types)
// ============================================================================

export * from './extends';
