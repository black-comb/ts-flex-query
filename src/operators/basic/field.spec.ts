import { constant } from '../../expressions/constant';
import { FieldExpression } from '../../expressions/field';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { getDataType } from '../../helpers/get-data-type';
import { pipeExpression } from '../../helpers/pipe-expression';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { DataTypeType } from '../../types/data-type';
import { field } from './field';

// import { arrayField, objectField, primitiveField } from './field';

describe('field', () => {
  it('primitive field', () => {
    const q = constant<SampleType1>(sample1.obj1);
    const q2 = pipeExpression(
      q,
      field('field2')
    );
    const result = q2.evaluate!(emptyContext);
    expect(q2 instanceof FieldExpression).toBeTruthy();
    expect(q2.dataType.type).toBe(DataTypeType.string);
    expect((q2 as FieldExpression).field).toEqual('field2');
    expect(result).toEqual('ABC');
  });

  it('object field', () => {
    const q = constant(sample1.obj2);
    const q2 = pipeExpression(
      q,
      field('fieldB')
    );
    const result = q2.evaluate!(emptyContext);
    expect(q2 instanceof FieldExpression).toBeTruthy();
    expect(q2.dataType).toEqual(getDataType(sample1.obj2.fieldB));
    expect((q2 as FieldExpression).field).toEqual('fieldB');
    expect(result).toEqual(sample1.obj2.fieldB);
  });

  it('array field', () => {
    const q = constant(sample1.obj2);
    const q2 = pipeExpression(
      q,
      field('fieldC')
    );
    const result = q2.evaluate!(emptyContext);
    expect(q2 instanceof FieldExpression).toBeTruthy();
    expect(q2.dataType).toEqual(getDataType(sample1.obj2.fieldC));
    expect((q2 as FieldExpression).field).toEqual('fieldC');
    expect(result).toEqual(sample1.obj2.fieldC);
  });

  // Typing tests:
  // function primitiveFieldForObject(): void {
  //   const fieldB = nameOf<SampleType2>()('fieldB');
  //   pipeExpression(
  //     constant<SampleType2>(sample1.obj2),
  //     //@ts-expect-error fieldB is an object:
  //     primitiveField(fieldB)
  //   );
  // }

  // function primitiveFieldForArray(): void {
  //   const fieldC = nameOf<SampleType2>()('fieldC');
  //   pipeExpression(
  //     constant<SampleType2>(sample1.obj2),
  //     //@ts-expect-error fieldC is an array:
  //     primitiveField(fieldC)
  //   );
  // }
});
