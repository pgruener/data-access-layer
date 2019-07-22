import { ObjectMap } from "./internal";
import { DataModel } from "./internal";
import { DataProviderConfig } from "./internal";

export interface DataModelConstructor<T extends DataModel>
{
  new(properties:ObjectMap):T
  computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string
}