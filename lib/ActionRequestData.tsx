import { ObjectMap } from "./ObjectMap";
import { DataModel } from "./DataModel";
import { DataProvider } from "./DataProvider";
import { DataModelRequestData } from "./DataModelRequestData";

/**
 * @class ActionRequestData
 * @extends DataModelRequestData
 */
export class ActionRequestData<T extends DataModel> extends DataModelRequestData
{
  constructor(dataProvider: DataProvider<DataModel>, dataModel: T, action: string, parameters: ObjectMap, payload: ObjectMap)
  {
    super(dataProvider, dataModel, action);
    this._actionUrl = dataModel.dataProviderConfig.getActionUrlSet().computeActionUrl(this.action, dataModel, parameters);
    this._payload = payload;
  }
}
