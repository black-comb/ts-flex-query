import { constant } from '../../expressions/constant';
import { evaluateExpression } from '../../helpers/evaluate-expression';
import { pipeExpression } from '../../helpers/pipe-expression';
import { sample1 } from '../../tests/sample-1';
import { field } from '../basic/field';
import {
  and,
  or
} from './boolean';
import { func } from './func';
import { value } from './value';

describe('boolean', () => {
  it('and', () => {
    const result = evaluateExpression(pipeExpression(
      constant(sample1.obj1),
      and(
        func('equal', field('field1'), value(1)),
        func('equal', field('field2'), value('ABC')),
        func('equal', field('field3'), value(undefined))
      )
    ));

    expect(result).toBe(true);
  });

  it('and with false result', () => {
    const result = evaluateExpression(pipeExpression(
      constant(sample1.obj1),
      and(
        func('equal', field('field1'), value(1)),
        func('equal', field('field2'), value('ABCD')),
        func('equal', field('field3'), value(undefined))
      )
    ));

    expect(result).toBe(false);
  });

  it('or', () => {
    const result = evaluateExpression(pipeExpression(
      constant(sample1.obj1),
      or(
        func('equal', field('field1'), value(1)),
        func('equal', field('field2'), value('ABCD')),
        func('equal', field('field3'), value(undefined))
      )
    ));

    expect(result).toBe(true);
  });
});
