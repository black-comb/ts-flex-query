import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { emptyContext } from '../../helpers/evaluation-context-utils';
import { pipeExpression } from '../../helpers/pipe-expression';
import { QueryFactory } from '../../helpers/query-factory';
import { expectType } from '../../helpers/utils';
import { sample1 } from '../../tests/sample-1';
import { SampleType1 } from '../../tests/types/sample-type-1';
import { field } from './field';
import { map } from './map';

describe('map', () => {
  it('to function', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      map((x) => pipeExpression(x, field('field2')))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual(['ABC', 'DEF', 'GHI', 'JKL']);

    expectType<string[]>()(result, true);
  });

  it('to operator', () => {
    const q = new QueryFactory<SampleType1[]>().create(
      map(field('field2'))
    );
    const result = evaluateExpression(pipeExpression(constant(sample1.obj1s), q), emptyContext);

    expect(result).toEqual(['ABC', 'DEF', 'GHI', 'JKL']);

    expectType<string[]>()(result, true);
  });

  it('to primitive field', () => {
    const result = pipeExpression(
      constant([sample1.obj1]),
      map('field1')
    ).evaluate!(emptyContext);
    expect(result).toEqual([1]);

    const x: number[] = result;
    // @ts-expect-error result is not a number.
    const y: number = result;
  });

  it('to object and primitive field', () => {
    const result = pipeExpression(
      constant([sample1.obj2]),
      map('fieldB'),
      map('field1')
    ).evaluate!(emptyContext);
    expect(result).toEqual([1]);

    const x: number[] = result;
    // @ts-expect-error result is not a number.
    const y: number = result;
  });

});
