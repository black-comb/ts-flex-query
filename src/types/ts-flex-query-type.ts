export type TsFlexQueryTypeProperty = '__tsFlexQueryType';

export type TsFlexQueryType = 'record';

export type TsFlexQueryTypeMarker<out T extends TsFlexQueryType> = {
  [TKey in TsFlexQueryTypeProperty]: T;
}
