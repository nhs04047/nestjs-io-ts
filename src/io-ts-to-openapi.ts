import { Type } from '@nestjs/common';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import * as t from 'io-ts';
import * as tt from './exports/type-export'

interface ExtendedSchemaObject extends SchemaObject {
  [key: `x-${string}`]: any;
}

export function iotsToOpenApi(codec: t.Any, visited: Set<any> = new Set()){
  const object: ExtendedSchemaObject = {}

  if(new tt.UnionType()._tag === )
}
