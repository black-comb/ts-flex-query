import { EvaluationContext } from '../types/evaluation-context';

export const emptyContext: EvaluationContext = {
  variables: {}
};

export function addVariable(context: EvaluationContext, symbol: symbol, value: unknown): EvaluationContext {
  return {
    ...context,
    variables: {
      ...context.variables,
      [symbol]: value
    }
  };
}
