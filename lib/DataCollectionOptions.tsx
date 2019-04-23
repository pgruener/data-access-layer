import { DataCollectionChangeListener } from "./DataCollectionChangeListener";
import { DataModel } from "./DataModel";

/**
 * @interface DataCollectionOptions
 */
export interface DataCollectionOptions<T extends DataModel>
{
  dataCollectionChangeListener?:DataCollectionChangeListener<T>
  scope?:string
}