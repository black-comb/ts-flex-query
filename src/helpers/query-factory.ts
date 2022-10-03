import { PipeOperator } from '../core/pipe-operator';
import { CombineOperator } from '../operators/basic/combine';

export class QueryFactory<in T> {

  public create<T2>(
    operator1: PipeOperator<T, T2>
  ): PipeOperator<T, T2>;
  public create<T2, T3>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>
  ): PipeOperator<T, T3>;
  public create<T2, T3, T4>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>
  ): PipeOperator<T, T4>;
  public create<T2, T3, T4, T5>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>,
    operator4: PipeOperator<T4, T5>
  ): PipeOperator<T, T5>;
  public create<T2, T3, T4, T5, T6>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>,
    operator4: PipeOperator<T4, T5>,
    operator5: PipeOperator<T5, T6>
  ): PipeOperator<T, T6>;
  public create<T2, T3, T4, T5, T6, T7>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>,
    operator4: PipeOperator<T4, T5>,
    operator5: PipeOperator<T5, T6>,
    operator6: PipeOperator<T6, T7>
  ): PipeOperator<T, T7>;
  public create<T2, T3, T4, T5, T6, T7, T8>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>,
    operator4: PipeOperator<T4, T5>,
    operator5: PipeOperator<T5, T6>,
    operator6: PipeOperator<T6, T7>,
    operator7: PipeOperator<T7, T8>
  ): PipeOperator<T, T8>;
  public create<T2, T3, T4, T5, T6, T7, T8, T9>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>,
    operator4: PipeOperator<T4, T5>,
    operator5: PipeOperator<T5, T6>,
    operator6: PipeOperator<T6, T7>,
    operator7: PipeOperator<T7, T8>,
    operator8: PipeOperator<T8, T9>
  ): PipeOperator<T, T9>;
  public create<T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    operator1: PipeOperator<T, T2>,
    operator2: PipeOperator<T2, T3>,
    operator3: PipeOperator<T3, T4>,
    operator4: PipeOperator<T4, T5>,
    operator5: PipeOperator<T5, T6>,
    operator6: PipeOperator<T6, T7>,
    operator7: PipeOperator<T7, T8>,
    operator8: PipeOperator<T8, T9>,
    operator9: PipeOperator<T9, T10>
  ): PipeOperator<T, T10>;
  // eslint-disable-next-line class-methods-use-this
  public create(...operators: PipeOperator[]): PipeOperator {
    return new CombineOperator(operators);
  }

}
