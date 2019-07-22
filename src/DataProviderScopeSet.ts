import { DataProviderScope } from "./internal";

export interface DataProviderScopeSet
{
  index?:DataProviderScope
  [s:string]:DataProviderScope
}
