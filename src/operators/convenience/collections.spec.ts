import { constant } from '../../expressions';
import {
  evaluateExpression,
  pipeExpression
} from '../../helpers';
import { sample1 } from '../../tests/sample-1';
import { distinct } from './collections';

describe('collections', () => {
  describe('distinct', () => {
    it('is correct', () => {
      const expr = pipeExpression(constant([sample1.obj1, sample1.obj2, sample1.obj1]), distinct());
      const result = evaluateExpression(expr);

      expect(result).toEqual([sample1.obj1, sample1.obj2]);
    });
  });
});
