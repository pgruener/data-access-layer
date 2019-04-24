import { ObjectMap } from "./ObjectMap";
import { RequestVerb } from "./RequestVerb";
import { DataModel } from "./DataModel";
import { DataProvider } from "./DataProvider";
import { RequestData } from "./RequestData";

/**
 * @class DataModelRequestData
 * @extends RequestData
 */
export class DataModelRequestData extends RequestData<DataModel>
{
  protected _propertiesSnapshot: ObjectMap;
  protected _changedPropertiesSnapshot: ObjectMap;
  protected _dataModel: DataModel;
  protected readonly action: string | RequestVerb;

  constructor(dataProvider: DataProvider<DataModel>, dataModel: DataModel, action: string | RequestVerb)
  {
    super(dataProvider);
    this._dataModel = dataModel;
    this._propertiesSnapshot = dataModel.originalProperties; // TODO: Save Copy
    this._changedPropertiesSnapshot = dataModel.dataProviderConfig.prepareForServer(dataModel); // TODO: return Copy AND Just do this with newly changed properties...
    this.action = action;
    this._actionUrl = this._dataModel.dataProviderConfig.getActionUrlSet().computeActionUrl(this.action, this._dataModel);
    this._payload = this._dataModel.dataProviderConfig.computePayloadForRequest(this);
  }

  handleResponse(response: ObjectMap)
  {
    super.handleResponse(response);

    if (this.action == 'create')
    {
      this._dataProvider.onAfterNewInstance(this.dataModel, this._response as ObjectMap);
    }
    else
    {
      this._dataProvider.onAfterUpdate(this._response);
    }
  }

  /**
   * Attribute accessor for propertiesSnapshot
   */
  get propertiesSnapshot()
  {
    return this._propertiesSnapshot;
  }

  /**
   * Attribute accessor for changedPropertiesSnapshot
   */
  get changedPropertiesSnapshot()
  {
    return this._changedPropertiesSnapshot;
  }

  /**
   * Attribute accessor for dataModel
   */
  get dataModel()
  {
    return this._dataModel;
  }
}
