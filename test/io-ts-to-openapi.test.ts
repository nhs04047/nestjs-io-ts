import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import * as t from 'io-ts';

import { Email, IPv4, UUID } from '../src/extends';
import { ioTsToOpenAPI } from '../src/io-ts-to-openapi';

describe('ioTsToOpenAPI', () => {
  describe('primitive types', () => {
    it('should convert string type', () => {
      const schema = ioTsToOpenAPI(t.string);
      expect(schema).toEqual({ type: 'string' });
    });

    it('should convert number type', () => {
      const schema = ioTsToOpenAPI(t.number);
      expect(schema).toEqual({ type: 'number' });
    });

    it('should convert boolean type', () => {
      const schema = ioTsToOpenAPI(t.boolean);
      expect(schema).toEqual({ type: 'boolean' });
    });

    it('should convert null type', () => {
      const schema = ioTsToOpenAPI(t.null);
      expect(schema).toEqual({ nullable: true });
    });

    it('should convert undefined type', () => {
      const schema = ioTsToOpenAPI(t.undefined);
      expect(schema).toEqual({ nullable: true });
    });
  });

  describe('object types', () => {
    it('should convert interface type', () => {
      const UserCodec = t.type({
        name: t.string,
        age: t.number,
      });

      const schema = ioTsToOpenAPI(UserCodec) as SchemaObject;

      expect(schema.type).toBe('object');
      expect(schema.properties?.name).toEqual({ type: 'string' });
      expect(schema.properties?.age).toEqual({ type: 'number' });
      expect(schema.required).toContain('name');
      expect(schema.required).toContain('age');
    });

    it('should convert partial type without required fields', () => {
      const PartialCodec = t.partial({
        name: t.string,
        age: t.number,
      });

      const schema = ioTsToOpenAPI(PartialCodec) as SchemaObject;

      expect(schema.type).toBe('object');
      expect(schema.properties?.name).toEqual({ type: 'string' });
      expect(schema.required).toBeUndefined();
    });
  });

  describe('array types', () => {
    it('should convert array type', () => {
      const ArrayCodec = t.array(t.string);
      const schema = ioTsToOpenAPI(ArrayCodec) as SchemaObject;

      expect(schema.type).toBe('array');
      expect(schema.items).toEqual({ type: 'string' });
    });

    it('should convert readonly array type', () => {
      const ReadonlyArrayCodec = t.readonlyArray(t.number);
      const schema = ioTsToOpenAPI(ReadonlyArrayCodec) as SchemaObject;

      expect(schema.type).toBe('array');
      expect(schema.items).toEqual({ type: 'number' });
      expect(schema.readOnly).toBe(true);
    });
  });

  describe('union types', () => {
    it('should convert union type to oneOf', () => {
      const UnionCodec = t.union([t.string, t.number]);
      const schema = ioTsToOpenAPI(UnionCodec) as SchemaObject;

      expect(schema.oneOf).toHaveLength(2);
    });

    it('should handle nullable union (T | undefined)', () => {
      const NullableCodec = t.union([t.string, t.undefined]);
      const schema = ioTsToOpenAPI(NullableCodec) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.nullable).toBe(true);
    });

    it('should handle nullable union (T | null)', () => {
      const NullableCodec = t.union([t.string, t.null]);
      const schema = ioTsToOpenAPI(NullableCodec) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.nullable).toBe(true);
    });
  });

  describe('literal types', () => {
    it('should convert string literal type', () => {
      const LiteralCodec = t.literal('active');
      const schema = ioTsToOpenAPI(LiteralCodec) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.enum).toEqual(['active']);
    });

    it('should convert number literal type', () => {
      const LiteralCodec = t.literal(42);
      const schema = ioTsToOpenAPI(LiteralCodec) as SchemaObject;

      expect(schema.type).toBe('number');
      expect(schema.enum).toEqual([42]);
    });
  });

  describe('keyof types', () => {
    it('should convert keyof type to string enum', () => {
      const KeyofCodec = t.keyof({
        active: null,
        inactive: null,
        pending: null,
      });
      const schema = ioTsToOpenAPI(KeyofCodec) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.enum).toContain('active');
      expect(schema.enum).toContain('inactive');
      expect(schema.enum).toContain('pending');
    });
  });

  describe('intersection types', () => {
    it('should merge intersection types', () => {
      const BaseCodec = t.type({ id: t.string });
      const ExtendedCodec = t.type({ name: t.string });
      const IntersectionCodec = t.intersection([BaseCodec, ExtendedCodec]);

      const schema = ioTsToOpenAPI(IntersectionCodec) as SchemaObject;

      expect(schema.type).toBe('object');
      expect(schema.properties?.id).toEqual({ type: 'string' });
      expect(schema.properties?.name).toEqual({ type: 'string' });
    });
  });

  describe('branded types', () => {
    it('should convert Email type with format', () => {
      const schema = ioTsToOpenAPI(Email) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.format).toBe('email');
    });

    it('should convert UUID type with format', () => {
      const schema = ioTsToOpenAPI(UUID) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.format).toBe('uuid');
    });

    it('should convert IPv4 type with format', () => {
      const schema = ioTsToOpenAPI(IPv4) as SchemaObject;

      expect(schema.type).toBe('string');
      expect(schema.format).toBe('ipv4');
    });
  });

  describe('special types', () => {
    it('should convert bigint type', () => {
      const schema = ioTsToOpenAPI(t.bigint) as SchemaObject;

      expect(schema.type).toBe('integer');
      expect(schema.format).toBe('int64');
    });

    it('should convert readonly type', () => {
      const ReadonlyCodec = t.readonly(t.type({ name: t.string }));
      const schema = ioTsToOpenAPI(ReadonlyCodec) as SchemaObject;

      expect(schema.type).toBe('object');
      expect(schema.readOnly).toBe(true);
    });

    it('should convert dictionary type', () => {
      const DictCodec = t.record(t.string, t.number);
      const schema = ioTsToOpenAPI(DictCodec) as SchemaObject;

      expect(schema.type).toBe('object');
      expect(schema.additionalProperties).toEqual({ type: 'number' });
    });
  });

  describe('nested complex types', () => {
    it('should handle deeply nested objects', () => {
      const NestedCodec = t.type({
        user: t.type({
          profile: t.type({
            name: t.string,
            settings: t.type({
              theme: t.string,
            }),
          }),
        }),
      });

      const schema = ioTsToOpenAPI(NestedCodec) as SchemaObject;

      expect(schema.type).toBe('object');
      const userSchema = schema.properties?.user as SchemaObject;
      expect(userSchema.type).toBe('object');
    });
  });
});
