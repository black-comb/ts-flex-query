import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { flatMap } from '../basic/flat-map';
import { map } from '../basic/map';
import { field } from './field';

describe('flatMap', () => {
  it('to field', () => {
    const result = evaluateExpression(pipeExpression(
      constant([sample1.obj2]),
      flatMap('fieldC'),
      map('field1')
    ), emptyContext);
    expect(result).toEqual([1]);
    expectType<number[]>()(result, true);
  });

  it('with operator', () => {
    const result = evaluateExpression(pipeExpression(
      constant([sample1.obj2]),
      flatMap(field('fieldC')),
      map('field1')
    ), emptyContext);
    expect(result).toEqual([1]);
    expectType<number[]>()(result, true);
  });
});
