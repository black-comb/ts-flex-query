import { Expression } from '../../core/expression';
import { PipeOperator } from '../../core/pipe-operator';
import { FieldExpression } from '../../expressions/field';
import {
  DataType,
  DataTypeType
} from '../../types/data-type';

export class FieldOperator implements PipeOperator {
  public constructor(public readonly name: string, private readonly type: DataType = { type: DataTypeType.unknown }) {
  }

  public instantiate(input: Expression): Expression<any> {
    return new FieldExpression(input, this.name, this.apply(input.dataType));
  }

  private apply(type: DataType): DataType {
    const suggestion: DataType = this.applyWithoutKnownType(type);
    return suggestion.type === DataTypeType.unknown
      ? this.type
      : suggestion;
  }

  private applyWithoutKnownType(type: DataType): DataType {
    switch (type.type) {
      case DataTypeType.object:
        return type.fields[this.name] ?? { type: DataTypeType.undefined };
      case DataTypeType.unknownObject:
      case DataTypeType.unknown:
        return { type: DataTypeType.unknown };
      default:
        return { type: DataTypeType.undefined };
    }
  }
}

export function field<TIn, TField extends keyof NonNullable<NoInfer<TIn>> & string>(
  name: TField
): PipeOperator<TIn, undefined extends TIn ? NonNullable<TIn>[TField] | undefined : NonNullable<TIn>[TField]> {
  return new FieldOperator(name);
}

// Operators defining the type of the selected field (primitive, object, or array):

// export function primitiveField<TIn, TField extends keyof NonNullable<TIn> & string>(
//   field: TField extends infer T ? IfNullablePrimitive<NonNullable<TIn>[TField], TField, never> : never
// ): PipeOperator<TIn, undefined extends TIn ? NonNullable<TIn>[TField] | undefined : NonNullable<TIn>[TField]> {
//   return new FieldOperator(field, { type: DataTypeType.unknownPrimitive });
// }

// export function objectField<TIn, TField extends keyof NonNullable<TIn> & string>(
//   field: TField extends infer T ? IfNullableObject<NonNullable<TIn>[TField], TField, never> : never
// ): PipeOperator<TIn, undefined extends TIn ? NonNullable<TIn>[TField] | undefined : NonNullable<TIn>[TField]> {
//   return new FieldOperator(field, { type: DataTypeType.unknownObject });
// }

// export function arrayField<TIn, TField extends keyof NonNullable<TIn> & string>(
//   field: TField extends infer T ? IfNullableArray<NonNullable<TIn>[TField], TField, never> : never
// ): PipeOperator<TIn, undefined extends TIn ? NonNullable<TIn>[TField] | undefined : NonNullable<TIn>[TField]> {
//   return new FieldOperator(field, { type: DataTypeType.unknownArray });
// }
