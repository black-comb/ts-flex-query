import { PipeOperator } from '../../core';
import { func } from './func';
import { noOp } from './no-op';

export function count(): PipeOperator<any[] | undefined, number> {
  return func('count', noOp());
}
