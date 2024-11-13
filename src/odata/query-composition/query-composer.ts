import {
  isDefined,
  unexpected
} from '../../helpers/utils';
import {
  ODataAggregateElement,
  ODataApply,
  ODataExpand,
  ODataOrderBy,
  ODataRequest
} from '../helpers/definitions';
import {
  ODataCustomQueryComposer,
  PrefixedDefaultQueryParts,
  SerializableType
} from './types';

interface QueryComposerParams {
  customQueryComposer?: ODataCustomQueryComposer;
}

/** Creates a query text from an ODataRequest. */
export class QueryComposer {
  public constructor(private readonly params: QueryComposerParams) {
  }

  public buildFromRequest(request: ODataRequest, partSeparator = '&'): string {
    const actualSelect = [
      ...request.select ?? [],
      ...Object.keys(request.expand ?? {})
    ];
    const queryParts: Partial<PrefixedDefaultQueryParts> = {
      $apply: request.apply ? QueryComposer.buildApplyPart(request.apply) : undefined,
      $count: request.count || undefined,
      $filter: request.filter?.value || undefined,
      $orderBy: request.orderBy && QueryComposer.buildOrderByPart(request.orderBy),
      $skip: request.skip || undefined,
      $top: request.top,
      $select: actualSelect.length ? actualSelect.join(',') : undefined,
      $expand: request.expand && Object.keys(request.expand).length ? this.buildExpandPart(request.expand) : undefined
    };
    const finalQueryParts = this.params.customQueryComposer?.({ request, defaultParts: queryParts }) ?? queryParts;
    return Object
      .entries(finalQueryParts)
      .filter((entry): entry is [string, SerializableType] => isDefined(entry[1]))
      .map((entry) => `${entry[0]}=${entry[1].toString().replace('&', '%26')}`)
      .join(partSeparator);
  }

  private static buildApplyPart(apply: ODataApply[]): string | undefined {
    return apply.length ? apply.map(QueryComposer.serializeApply).join('/') : undefined;
  }

  private static serializeApply(apply: ODataApply): string {
    switch (apply.type) {
      case 'groupby': {
        const groupApply: string = QueryComposer.buildApplyPart(apply.groupApply) || '';
        const groupByFields: string = apply.fields.join(',');
        return `groupby((${groupByFields})${groupApply && ',' + groupApply})`;
      }
      case 'aggregate': {
        const elements = apply.elements.map(QueryComposer.serializeAggregateElement).join(',');
        return `aggregate(${elements})`;
      }
      case 'filter':
        return `filter(${apply.value})`;
      default:
        return unexpected(apply);
    }
  }

  private static serializeAggregateElement(element: ODataAggregateElement): string {
    return `${element.field ? element.field + ' with ' : ''}${element.aggregationFunction} as ${element.name}`;
  }

  private buildExpandPart(expand: ODataExpand): string {
    return Object
      .entries(expand)
      .map((v) => ({ field: v[0], request: v[1] && this.buildFromRequest(v[1], ';') }))
      .map((v) => v.request ? `${v.field}(${v.request})` : v.field)
      .join(',');
  }

  private static buildOrderByPart(orderBy: ODataOrderBy[]): string | undefined {
    return orderBy.length
      ? orderBy
        .map((element) => `${element.field}${element.mode === 'asc' ? '' : ` ${element.mode}`}`)
        .join(',')
      : undefined;
  }
}
