import { constant } from '../../expressions';
import {
  evaluateExpression,
  pipeExpression
} from '../../helpers';
import { sample1 } from '../../tests/sample-1';
import {
  distinct,
  filterDefined
} from './collections';

describe('collections', () => {
  describe('distinct', () => {
    it('is correct', () => {
      const expr = pipeExpression(constant([sample1.obj1, sample1.obj2, sample1.obj1]), distinct());
      const result = evaluateExpression(expr);

      expect(result).toEqual([sample1.obj1, sample1.obj2]);
    });
  });

  describe('filterDefined', () => {
    it('filters correctly', () => {
      const expr = pipeExpression(constant([undefined, sample1.obj1]), filterDefined());
      const result = evaluateExpression(expr);

      expect(result).toEqual([sample1.obj1]);
    });
  });
});
