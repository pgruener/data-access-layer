import { DataModel } from "./DataModel";
import { ObjectMap } from "./ObjectMap";

export interface ExternalDataCollectionFactory
{
  find<T extends DataModel>(dataProviderName:string, searchMap:ObjectMap|string):T
}
