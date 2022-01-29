import { unexpected } from '../../helpers/utils';
import {
  ODataAggregateElement,
  ODataApply,
  ODataExpand,
  ODataOrderBy,
  ODataRequest
} from './definitions';

export class QueryTextBuilder {
  public static buildFromRequest(request: ODataRequest, partSeparator = '&'): string {
    const actualSelect = [
      ...(request.select ?? []),
      ...Object.keys(request.expand ?? {})
    ];
    const queryParts = {
      apply: request.apply ? QueryTextBuilder.buildApplyPart(request.apply) : undefined,
      count: request.count || undefined,
      filter: request.filter?.value || undefined,
      orderBy: request.orderBy && QueryTextBuilder.buildOrderByPart(request.orderBy),
      skip: request.skip,
      top: request.top,
      select: actualSelect.length ? actualSelect.join(',') : undefined,
      expand: request.expand && Object.keys(request.expand).length ? QueryTextBuilder.buildExpandPart(request.expand) : undefined
    };
    return Object
      .entries(queryParts)
      .filter(entry => entry[1])
      .map(entry => `$${entry[0]}=${entry[1]}`)
      .join(partSeparator);
  }

  private static buildApplyPart(apply: ODataApply[]): string | undefined {
    return apply.length ? apply.map(QueryTextBuilder.serializeApply).join('/') : undefined;
  }

  private static serializeApply(apply: ODataApply): string {
    switch (apply.type) {
      case 'groupby': {
        const groupApply: string = QueryTextBuilder.buildApplyPart(apply.groupApply) || '';
        const groupByFields: string = apply.fields.join(',');
        return `groupby((${groupByFields})${groupApply && (',' + groupApply)})`;
      }
      case 'aggregate': {
        const elements = apply.elements.map(QueryTextBuilder.serializeAggregateElement).join(',');
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

  private static buildExpandPart(expand: ODataExpand): string {
    return Object
      .entries(expand)
      .map(v => ({ field: v[0], request: v[1] && QueryTextBuilder.buildFromRequest(v[1], ';') }))
      .map(v => v.request ? `${v.field}(${v.request})` : v.field)
      .join(',');
  }

  private static buildOrderByPart(orderBy: ODataOrderBy[]): string | undefined {
    return orderBy.length
      ? orderBy
        .map(element => `${element.field}${element.mode === 'asc' ? '' : ` ${element.mode}`}`)
        .join(',')
      : undefined;
  }
}
