import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import deepmerge from 'deepmerge';
import * as t from 'io-ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IoTsType = t.Type<any, any, any>;

/**
 * Schema or reference object for OpenAPI specification
 * @since 1.0.0
 */
export type SchemaOrReferenceObject = SchemaObject | ReferenceObject;

/**
 * Known branded type names and their OpenAPI format mappings
 * @internal
 */
const BRANDED_TYPE_FORMATS: Record<
  string,
  { type: string; format?: string; pattern?: string }
> = {
  Email: { type: 'string', format: 'email' },
  IPv4: { type: 'string', format: 'ipv4' },
  IPv6: { type: 'string', format: 'ipv6' },
  IP: { type: 'string', format: 'ip' },
  UUID: { type: 'string', format: 'uuid' },
  URL: { type: 'string', format: 'uri' },
  DateString: { type: 'string', format: 'date' },
  DateTimeString: { type: 'string', format: 'date-time' },
  Phone: { type: 'string', format: 'phone' },
  NonEmptyString: { type: 'string', minLength: 1 } as {
    type: string;
    format?: string;
    pattern?: string;
  },
  PositiveNumber: { type: 'number', minimum: 0 } as {
    type: string;
    format?: string;
    pattern?: string;
  },
  Integer: { type: 'integer' },
  Port: { type: 'integer', minimum: 0, maximum: 65535 } as {
    type: string;
    format?: string;
    pattern?: string;
  },
};

/**
 * Converts an io-ts type to an OpenAPI 3.0 schema object
 *
 * Supports most io-ts types including:
 * - Primitive types (string, number, boolean, null)
 * - Complex types (object, array, tuple)
 * - Union and intersection types
 * - Branded types (Email, UUID, etc.)
 * - Recursive types
 *
 * @param ioTsType - The io-ts type to convert
 * @param visited - Set of already visited types (for circular reference detection)
 * @returns OpenAPI schema object or reference object
 *
 * @example
 * ```typescript
 * const UserCodec = t.type({
 *   name: t.string,
 *   email: Email,
 *   age: t.number,
 * });
 *
 * const schema = ioTsToOpenAPI(UserCodec);
 * // Returns: {
 * //   type: 'object',
 * //   properties: {
 * //     name: { type: 'string' },
 * //     email: { type: 'string', format: 'email' },
 * //     age: { type: 'number' }
 * //   },
 * //   required: ['name', 'email', 'age']
 * // }
 * ```
 *
 * @since 1.0.0
 */
export function ioTsToOpenAPI(
  ioTsType: IoTsType,
  visited: Set<IoTsType> = new Set(),
): SchemaOrReferenceObject {
  const object: SchemaObject = {};

  // Handle circular references
  if (visited.has(ioTsType)) {
    return { $ref: `#/components/schemas/${ioTsType.name}` };
  }

  visited.add(ioTsType);

  try {
    // Check for known branded types first by name
    if (ioTsType.name && BRANDED_TYPE_FORMATS[ioTsType.name]) {
      const brandedFormat = BRANDED_TYPE_FORMATS[ioTsType.name];
      Object.assign(object, brandedFormat);
      return object;
    }

    if (ioTsType instanceof t.StringType) {
      object.type = 'string';
    } else if (ioTsType instanceof t.NumberType) {
      object.type = 'number';
    } else if (ioTsType instanceof t.BooleanType) {
      object.type = 'boolean';
    } else if (ioTsType instanceof t.NullType) {
      object.nullable = true;
    } else if (
      ioTsType instanceof t.VoidType ||
      ioTsType instanceof t.UndefinedType
    ) {
      // OpenAPI 3.0 doesn't have void/undefined, represent as nullable
      object.nullable = true;
    } else if (ioTsType instanceof t.AnyType) {
      // OpenAPI 3.0 uses empty object for any type
      // Return empty object to allow any value
    } else if (ioTsType instanceof t.TupleType) {
      object.type = 'array';
      object.items = {
        oneOf: ioTsType.types.map((type: IoTsType) =>
          ioTsToOpenAPI(type, visited),
        ),
      };
      object.minItems = ioTsType.types.length;
      object.maxItems = ioTsType.types.length;
    } else if (ioTsType instanceof t.ArrayType) {
      object.type = 'array';
      object.items = ioTsToOpenAPI(ioTsType.type, visited);
    } else if (
      ioTsType instanceof t.InterfaceType ||
      ioTsType instanceof t.PartialType
    ) {
      object.type = 'object';
      object.properties = {};
      object.required = [];

      for (const [key, schema] of Object.entries(ioTsType.props)) {
        object.properties[key] = ioTsToOpenAPI(schema as IoTsType, visited);
        if (ioTsType instanceof t.InterfaceType) {
          object.required.push(key);
        }
      }

      if (object.required.length === 0) {
        delete object.required;
      }
    } else if (ioTsType instanceof t.UnionType) {
      // Check if it's a nullable union (T | undefined | null)
      const nonNullableTypes = ioTsType.types.filter(
        (type: IoTsType) =>
          !(type instanceof t.UndefinedType) &&
          !(type instanceof t.NullType) &&
          !(type instanceof t.VoidType),
      );

      const hasNullable = nonNullableTypes.length < ioTsType.types.length;

      if (nonNullableTypes.length === 1) {
        // Simple nullable type
        const innerSchema = ioTsToOpenAPI(nonNullableTypes[0], visited);
        Object.assign(object, innerSchema);
        if (hasNullable) {
          object.nullable = true;
        }
      } else if (nonNullableTypes.length > 1) {
        // Complex union
        object.oneOf = nonNullableTypes.map((type: IoTsType) =>
          ioTsToOpenAPI(type, visited),
        );
        if (hasNullable) {
          object.nullable = true;
        }
      } else {
        // All nullable types
        object.nullable = true;
      }
    } else if (ioTsType instanceof t.LiteralType) {
      const value = ioTsType.value;
      object.type = typeof value as 'string' | 'number' | 'boolean';
      object.enum = [value];
    } else if (ioTsType instanceof t.KeyofType) {
      object.type = 'string';
      object.enum = Object.keys(ioTsType.keys);
    } else if (ioTsType instanceof t.IntersectionType) {
      const merged = ioTsType.types.reduce(
        (acc: SchemaOrReferenceObject, type: IoTsType) => {
          return deepmerge(
            acc as Partial<SchemaObject>,
            ioTsToOpenAPI(type, visited) as Partial<SchemaObject>,
            {
              arrayMerge: (target, source) =>
                Array.from(new Set([...target, ...source])),
            },
          );
        },
        {} as SchemaOrReferenceObject,
      );
      Object.assign(object, merged);
    } else if (ioTsType instanceof t.UnknownType) {
      // OpenAPI 3.0 uses empty object for unknown type
      // Return empty object to allow any value
    } else if (ioTsType instanceof t.AnyArrayType) {
      object.type = 'array';
      object.items = {}; // Any item type
    } else if (ioTsType instanceof t.FunctionType) {
      // Functions cannot be represented in OpenAPI, skip with description
      object.description =
        'Function types are not supported in OpenAPI. This field should be ignored.';
    } else if (ioTsType instanceof t.ReadonlyType) {
      const innerSchema = ioTsToOpenAPI(ioTsType.type, visited);
      Object.assign(object, innerSchema);
      object.readOnly = true;
    } else if (ioTsType instanceof t.ReadonlyArrayType) {
      object.type = 'array';
      object.items = ioTsToOpenAPI(ioTsType.type, visited);
      object.readOnly = true;
    } else if (ioTsType instanceof t.BigIntType) {
      object.type = 'integer';
      object.format = 'int64';
    } else if (ioTsType instanceof t.DictionaryType) {
      object.type = 'object';
      object.additionalProperties = ioTsToOpenAPI(ioTsType.codomain, visited);
    } else if (ioTsType instanceof t.RefinementType) {
      // Handle branded/refined types
      const baseSchema = ioTsToOpenAPI(ioTsType.type, visited);
      Object.assign(object, baseSchema);

      // Check if this is a known branded type
      if (ioTsType.name && BRANDED_TYPE_FORMATS[ioTsType.name]) {
        const brandedFormat = BRANDED_TYPE_FORMATS[ioTsType.name];
        Object.assign(object, brandedFormat);
      } else if (ioTsType.name) {
        object.description = `Validated type: ${ioTsType.name}`;
      }
    } else if (ioTsType instanceof t.TaggedUnionType) {
      object.oneOf = ioTsType.types.map((type: IoTsType) =>
        ioTsToOpenAPI(type, visited),
      );
      object.discriminator = {
        propertyName: ioTsType.tag,
      };
    } else if (ioTsType instanceof t.RecursiveType) {
      return {
        $ref: `#/components/schemas/${ioTsType.name}`,
      };
    } else if (ioTsType instanceof t.ExactType) {
      // Exact types are handled the same as the wrapped type
      const innerSchema = ioTsToOpenAPI(ioTsType.type, visited);
      Object.assign(object, innerSchema);
      object.additionalProperties = false;
    }

    return object;
  } finally {
    visited.delete(ioTsType);
  }
}
