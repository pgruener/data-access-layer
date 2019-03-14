import { DataModel } from "./DataModel";

interface DataModelListener
{
  dataModelChanged:(dataModel:DataModel) => void
}

export = DataModelListener