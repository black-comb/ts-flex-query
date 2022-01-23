import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { SampleType2 } from '../../tests/types/sample-type-2';
import { querySchema } from '../convenience/query-schema';
import { groupBy } from './group';

describe('group', () => {
  it('primitive field', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      groupBy('field1')
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual([
      {
        key: 1,
        elements: [sample1.obj1s[0]]
      },
      {
        key: 41,
        elements: [sample1.obj1s[2]]
      },
      {
        key: 42,
        elements: [sample1.obj1s[1], sample1.obj1s[3]]
      }
    ]);
  });

  it('record', () => {
    const q = new QueryFactory<SampleType2[]>().create(
      groupBy(querySchema({
        fieldB: {
          field1: true,
          field2: true
        }
      }))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj2s), q), emptyContext);
    expect(result).toEqual([
      {
        key: {
          fieldB: {
            field1: sample1.obj1.field1,
            field2: sample1.obj1.field2
          }
        },
        elements: sample1.obj2s
      }
    ]);
  });
});
