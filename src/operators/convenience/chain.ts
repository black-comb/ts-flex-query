import { ObjectFields } from '../../types/utils';
import { CombineOperator } from '../basic/combine';
import { FieldOperator } from '../basic/field';
import { PipeOperator } from '../basic/pipe-operator';

export function chain<
  TObj1,
  TField1 extends ObjectFields<NonNullable<TObj1>> & string,
  TField2 extends keyof NonNullable<NonNullable<TObj1>[TField1]> & string
>(
  field1: TField1,
  field2: TField2
): PipeOperator<
  TObj1,
  undefined extends TObj1 | NonNullable<TObj1>[TField1]
  ? NonNullable<NonNullable<TObj1>[TField1]>[TField2] | undefined
  : NonNullable<NonNullable<TObj1>[TField1]>[TField2]
>;
export function chain<
  TObj1,
  TField1 extends ObjectFields<NonNullable<TObj1>> & string,
  TField2 extends ObjectFields<NonNullable<NonNullable<TObj1>[TField1]>> & string,
  TField3 extends keyof NonNullable<NonNullable<NonNullable<TObj1>[TField1]>[TField2]> & string
>(
  field1: TField1,
  field2: TField2,
  field3: TField3
): PipeOperator<
  TObj1,
  undefined extends TObj1 | NonNullable<TObj1>[TField1] | NonNullable<NonNullable<TObj1>[TField1]>[TField2]
  ? NonNullable<NonNullable<NonNullable<TObj1>[TField1]>[TField2]>[TField3] | undefined
  : NonNullable<NonNullable<NonNullable<TObj1>[TField1]>[TField2]>[TField3]
>;
export function chain(...fields: string[]): PipeOperator {
  const chainedOperators: PipeOperator[] = fields.map((field) => new FieldOperator(field));
  return new CombineOperator(chainedOperators);
}
