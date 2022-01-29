import { Expression } from '../../expressions/expression';
import { record } from '../../expressions/record';
import { pipeExpression } from '../../helpers/pipe-expression';
import { createObjectFromObject, unexpected } from '../../helpers/utils';
import { DataType, DataTypeType } from '../../types/data-type';
import { ExpressionResultType } from '../../types/expression-result-type';
import { IfObject, IfPrimitive } from '../../types/utils';
import { apply } from '../basic/apply';
import { FieldOperator } from '../basic/field';
import { map } from '../basic/map';
import { PipeOperator } from '../basic/pipe-operator';

// Copy primitive value to result.
export type PrimitiveSchemaSpec = true;
type PrimitiveQuerySchemaType<TFieldType> = TFieldType;

// Specify schema for object.
type ObjectSchemaSpec<T = any> = {
  [TKey in keyof NonNullable<T> & string]?: SpecificSchemaSpec<NonNullable<T>[TKey], T>
};
type NonNullableObjectSchemaType<TIn, TSchema extends ObjectSchemaSpec<TIn>> = {
  [key in keyof TSchema]: key extends keyof NonNullable<TIn>
  ? SchemaType<NonNullable<TIn>[key], NonNullable<TSchema[key]>>
  : never
};
type ObjectSchemaType<TIn, TSchema extends ObjectSchemaSpec<TIn>> = undefined extends TIn
  ? NonNullableObjectSchemaType<TIn, TSchema> | undefined
  : NonNullableObjectSchemaType<TIn, TSchema>;
type ValidObjectSchemaSpec<TObj, TSchema> = {
  [TKey in keyof TSchema]: TKey extends keyof NonNullable<TObj> ? ValidSchemaSpec<NonNullable<TObj>[TKey], TSchema[TKey]> : never
};

// Specify schema for objects in array.
export type ArraySchemaSpec<TElement = any> = [ObjectSchemaSpec<TElement>];
type ArraySchemaType<TElement, TSchema extends ArraySchemaSpec<TElement>> =
  (
    ObjectSchemaType<TElement, TSchema[number]>
  )[];

export type ExpressionSchemaSpec<TValue = any, TContainer = any> = TContainer extends null
  ? (valueExpr: Expression<TValue>) => Expression<unknown>
  : (valueExpr: Expression<TValue>, container: Expression<TContainer>) => Expression<unknown>;
type ExpressionSchemaType<TElement, TSchema extends ExpressionSchemaSpec<TElement>> = ExpressionResultType<ReturnType<TSchema>>;

export type SchemaSpec = PrimitiveSchemaSpec | ObjectSchemaSpec | ArraySchemaSpec | ExpressionSchemaSpec;
export type SpecificSchemaSpec<T, TContainer> = (
  IfPrimitive<
    T,
    PrimitiveSchemaSpec,
    IfObject<
      T,
      ObjectSchemaSpec<T>,
      NonNullable<T> extends (infer TElement)[] ? ArraySchemaSpec<TElement> : never
    >
  >
) | ExpressionSchemaSpec<T, TContainer>;
export type ValidSchemaSpec<TValue, TSchema> =
  TSchema extends [infer TObjectSchema]
  ? TValue extends (infer TElement)[] | undefined
  ? [ValidObjectSchemaSpec<TElement, TObjectSchema>]
  : never
  : TSchema extends Partial<Record<string, any>> // Object schema
  ? ValidObjectSchemaSpec<TValue, TSchema>
  : TSchema extends true
  ? IfPrimitive<TValue, TSchema, never>
  : TSchema extends (...args: any[]) => any
  ? TSchema
  : never;
export type SchemaType<TValue, TSchema extends SchemaSpec> =
  TSchema extends PrimitiveSchemaSpec
  ? PrimitiveQuerySchemaType<TValue>
  : TSchema extends ObjectSchemaSpec
  ? ObjectSchemaType<TValue, TSchema>
  : TSchema extends ArraySchemaSpec
  ? TValue extends (infer TElement)[] | undefined
  ? ArraySchemaType<TElement, TSchema>
  : never
  : TSchema extends ExpressionSchemaSpec
  ? ExpressionSchemaType<TValue, TSchema>
  : never;

export function querySchema<TIn, TSchema extends SpecificSchemaSpec<TIn, null>>(
  // Save TSchema from being generalized in the "extends" operation by propagating it to T first.
  schema: TSchema extends infer T ? T extends ValidSchemaSpec<TIn, TSchema> ? TSchema : ValidSchemaSpec<TIn, TSchema> : never
): PipeOperator<TIn, SchemaType<TIn, TSchema>> {
  return createOperatorForSchema(schema, null);
}

function isPrimitiveSchemaSpec(schema: SchemaSpec): schema is PrimitiveSchemaSpec {
  return typeof schema === 'boolean';
}

function isObjectSchemaSpec(schema: SchemaSpec): schema is ObjectSchemaSpec {
  return typeof schema === 'object' && !isArraySchemaSpec(schema);
}

function isArraySchemaSpec(schema: SchemaSpec): schema is ArraySchemaSpec {
  return Array.isArray(schema);
}

function isExpressionSchemaSpec(schema: SchemaSpec): schema is ExpressionSchemaSpec {
  return typeof schema === 'function';
}

function getSchemaDataType(schema: SchemaSpec): DataType {
  if (isPrimitiveSchemaSpec(schema)) {
    return {
      type: DataTypeType.unknownPrimitive
    };
  }

  if (isObjectSchemaSpec(schema)) {
    return {
      type: DataTypeType.unknownObject
    };
  }

  if (isArraySchemaSpec(schema)) {
    return {
      type: DataTypeType.unknownArray
    };
  }

  if (isExpressionSchemaSpec(schema)) {
    return {
      type: DataTypeType.unknown
    };
  }

  return unexpected(schema);
}

function doMap(objectSchema: ObjectSchemaSpec, mapOperator: (mapper: (input: Expression) => Expression) => PipeOperator): PipeOperator {
  return mapOperator(input => record(createObjectFromObject(
    objectSchema,
    (subSchema, field) =>
      pipeExpression(
        pipeExpression(input, new FieldOperator(field, getSchemaDataType(subSchema))),
        createOperatorForSchema(
          subSchema,
          input
        )
      )
  )));
}

export function createOperatorForSchema(schema: SchemaSpec, container: Expression | null): PipeOperator {
  if (isPrimitiveSchemaSpec(schema)) {
    return apply(input => input);
  }

  if (isObjectSchemaSpec(schema)) {
    return doMap(schema, apply);
  }

  if (isArraySchemaSpec(schema)) {
    return doMap(schema[0], map);
  }

  if (isExpressionSchemaSpec(schema)) {
    return apply(input => schema(input, container as Expression));
  }

  return unexpected(schema);
}