import { constant } from '../../expressions/constant';
import { record } from '../../expressions/record';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { merge } from './merge';

describe('merge', () => {
  it('flat records', () => {
    const q = new QueryFactory<SampleType1>().create(
      merge(record({
        newField1: constant(111),
        newField2: constant('111'),
        field2: constant(true),
        field3: constant(undefined)
      }))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1), q), emptyContext);

    expect(result).toEqual({ ...sample1.obj1, field3: undefined, newField1: 111, newField2: '111', field2: true });
  });

  it('deep records', () => {
    const q = new QueryFactory<SampleType2>().create(
      merge(record({
        newField1: constant(111),
        fieldB: constant({
          newField2: '111',
          field3: undefined
        })
      }))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj2), q), emptyContext);

    expect(result).toEqual({
      ...sample1.obj2,
      newField1: 111,
      fieldB: {
        ...sample1.obj2.fieldB,
        newField2: '111',
        field3: undefined
      }
    });
  });
});
