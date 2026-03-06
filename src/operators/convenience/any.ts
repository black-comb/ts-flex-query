import { PipeOperator } from '../../core';
import { func } from './func';
import { noOp } from './no-op';

/** Determines if the input list has any elements. */
export function any(): PipeOperator<any[] | undefined, boolean> {
  return func('any', noOp());
}
