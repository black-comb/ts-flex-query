import { DataType } from '../types/data-type';
import { EvaluationContext } from '../types/evaluation-context';

export interface Expression<out TResult = unknown> {
  readonly dataType: DataType;
  evaluate?(context: EvaluationContext): TResult;
}
