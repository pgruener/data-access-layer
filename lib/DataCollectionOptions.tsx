import { DataCollectionChangeListener } from "./internal";
import { DataModel } from "./internal";

/**
 * @interface DataCollectionOptions
 */
export interface DataCollectionOptions<T extends DataModel>
{
  dataCollectionChangeListener?:DataCollectionChangeListener<T>
  scope?:string
}