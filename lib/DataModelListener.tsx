import { DataModel } from "./DataModel";

export interface DataModelListener
{
  dataModelChanged:(dataModel:DataModel) => void
}
