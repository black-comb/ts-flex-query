import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { field } from '../basic/field';
import { filter } from '../basic/filter';
import { map } from '../basic/map';
import { func } from './func';
import { noOp } from './no-op';
import { value } from './value';

describe('func', () => {
  it('getLength', () => {
    const result = evaluateExpression(pipeExpression(constant('test'), func('getLength', noOp())), emptyContext);

    expect(result).toEqual(4);
  });

  it('nested functions', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      filter(func(
        'equal',
        func('subtract', field('field1'), value(38)),
        func('getLength', field('field2'))
      )),
      map(func('divideInteger', field('field3'), value(2)))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q));

    expect(result).toEqual([5]);
  });
});
