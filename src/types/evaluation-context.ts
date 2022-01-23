export interface EvaluationContext {
  variables: Partial<Record<symbol, unknown>>;
}
