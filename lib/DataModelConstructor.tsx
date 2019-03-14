import { ObjectMap } from "./ObjectMap";
import { DataModel } from "./DataModel";
import { DataProviderConfig } from "./DataProviderConfig";

export interface DataModelConstructor<T extends DataModel>
{
  new(properties:ObjectMap):T
  computeIdentityHashCode(dataModel: DataModel | ObjectMap, dataProviderConfig: DataProviderConfig):string
}