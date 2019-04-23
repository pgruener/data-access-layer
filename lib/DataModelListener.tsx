import { DataModel } from "./DataModel";

/**
 * Used to observe changes in {@link DataModel|DataModels}.
 * @interface DataModelListener
 */
export interface DataModelListener
{
  dataModelChanged:(dataModel:DataModel) => void
}
