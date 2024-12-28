import { Type } from '@nestjs/common';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import deepmerge from 'deepmerge';
import * as t from 'io-ts';

type IoTsType = t.Type<any>;
export type SchemaOrReferenceObject = SchemaObject | ReferenceObject;

export function is<T extends Type<IoTsType>>(
  input: IoTsType,
  factory: T,
): input is InstanceType<T> {
  const factories = t as unknown as Record<string, Type<IoTsType>>;
  return factory === factories[input.name];
}

export function ioTsToOpenAPI(
  ioTsType: IoTsType,
  visited: Set<any> = new Set(),
): SchemaOrReferenceObject {
  const object: SchemaOrReferenceObject = {};

  if (visited.has(ioTsType)) {
    return { $ref: `#${ioTsType.name}` };
  }

  visited.add(ioTsType);

  if (ioTsType instanceof t.StringType) {
    object.type = 'string';
  } else if (ioTsType instanceof t.NumberType) {
    object.type = 'number';
  } else if (ioTsType instanceof t.BooleanType) {
    object.type = 'boolean';
  } else if (ioTsType instanceof t.NullType) {
    object.type = 'null';
  } else if (
    ioTsType instanceof t.VoidType ||
    ioTsType instanceof t.UndefinedType
  ) {
    object.type = 'void';
  } else if (ioTsType instanceof t.AnyType) {
    object.type = 'any';
  } else if (ioTsType instanceof t.TupleType) {
    object.type = 'array';
    object.items = ioTsType.types.map((type) => ioTsToOpenAPI(type, visited));
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
    object.oneOf = ioTsType.types.map((type) => ioTsToOpenAPI(type, visited));
  } else if (ioTsType instanceof t.LiteralType) {
    object.type = typeof ioTsType.value;
    object.enum = [ioTsType.value];
  } else if (ioTsType instanceof t.KeyofType) {
    object.type = 'string';
    object.enum = Object.keys(ioTsType.keys);
  } else if (ioTsType instanceof t.IntersectionType) {
    const merged = ioTsType.types.reduce((acc, type) => {
      return deepmerge(
        acc,
        ioTsToOpenAPI(type, visited) as Partial<SchemaObject>,
        {
          arrayMerge: (target, source) =>
            Array.from(new Set([...target, ...source])),
        },
      );
    }, {} as SchemaOrReferenceObject);
    Object.assign(object, merged);
  } else if (ioTsType instanceof t.UnknownType) {
    object.type = 'unknown';
  } else if (ioTsType instanceof t.AnyArrayType) {
    object.type = 'array';
  } else if (ioTsType instanceof t.FunctionType) {
    object.type = 'function';
    object.description = 'Function types are not fully supported in OpenAPI.';
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
    object.format = 'bigint';
  } else if (ioTsType instanceof t.DictionaryType) {
    object.type = 'object';
    object.additionalProperties = ioTsToOpenAPI(ioTsType.codomain, visited);
  } else if (ioTsType instanceof t.RefinementType) {
    const baseSchema = ioTsToOpenAPI(ioTsType.type, visited);
    Object.assign(object, baseSchema);
    object.description = 'Refinement applied: ' + (ioTsType.name || '');
  } else if (ioTsType instanceof t.TaggedUnionType) {
    object.oneOf = ioTsType.types.map((type) => ioTsToOpenAPI(type, visited));
    object.discriminator = {
      propertyName: ioTsType.tag,
    };
  } else if (ioTsType instanceof t.RecursiveType) {
    return {
      $ref: `#/components/schemas/${ioTsType.name}`,
    };
  }

  visited.delete(ioTsType);

  return object;
}
