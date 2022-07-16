import {
  Expression,
  PipeOperator
} from '../core';
import { DataType } from '../types';

export class SearchExpression implements Expression {
  public readonly dataType: DataType;

  public constructor(
    public readonly inner: Expression,
    public readonly searchText: string
  ) {
    this.dataType = inner.dataType;
  }
}

export function search<TIn extends unknown[]>(text: string): PipeOperator<TIn, TIn extends any ? TIn : TIn> {
  return {
    instantiate: (e) => new SearchExpression(e, text)
  };
}
