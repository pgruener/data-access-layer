import { ObjectMap } from "./ObjectMap";
import { RequestVerb } from "./RequestVerb";
import { DataModel } from "./DataModel";
import { ActionUrl } from "./ActionUrl";
import { DataProvider } from "./DataProvider";

export abstract class RequestData<T>
{
  protected readonly _dataProvider:DataProvider<DataModel>
  protected _actionUrl:ActionUrl
  protected _payload:ObjectMap

  private _response:Object

  constructor(dataProvider:DataProvider<DataModel>)
  {
    this._dataProvider = dataProvider
  }

  public getActionUrl = () =>
  {
    return this._actionUrl
  }

  public computePayload = () =>
  {
    return this._payload
  }

  setResponse(response:Object)
  {
    if (this._response)
    {
      throw new Error('Setting response is only possible once.')
    }
    else
    {
      this._response = response
    }
  }
}

export class UrlRequestData extends RequestData<Object>
{
  private _scopeName:string

  constructor(dataProvider:DataProvider<DataModel>, url:string, scopeName:string)
  {
    super(dataProvider)
    this._actionUrl = { url:url, method: 'GET'}
    this._scopeName = scopeName
  }

  setResponse(response:ObjectMap[])
  {
    super.setResponse(response)
    this._dataProvider.onLoadedData(this._scopeName, response)
  }


  get scopeName()
  {
    return this._scopeName
  }
}

export class DataModelRequestData extends RequestData<DataModel>
{
  protected _propertiesSnapshot:ObjectMap
  protected _changedPropertiesSnapshot:ObjectMap
  protected _dataModel:DataModel
  protected readonly action:string|RequestVerb

  constructor(dataProvider:DataProvider<DataModel>, dataModel:DataModel, action:string|RequestVerb)
  {
    super(dataProvider)
    this._dataModel = dataModel
    this._propertiesSnapshot = dataModel.originalProperties // TODO: Save Copy
    this._changedPropertiesSnapshot = dataModel.dataProviderConfig.prepareForServer(dataModel)  // TODO: return Copy AND Just do this with newly changed properties...
    this.action = action

    this._actionUrl = this._dataModel.dataProviderConfig.getActionUrlSet().getActionUrl(this.action, this._dataModel)
    this._payload = this._dataModel.dataProviderConfig.computePayloadForRequest(this)
  }

  setResponse(response:ObjectMap)
  {
    super.setResponse(response)

    if (this.action == 'create')
    {
      this._dataProvider.onAfterNewInstance(this.dataModel, response)
    }
    else
    {
      this._dataProvider.onAfterUpdate(response)
    }
  }


  get propertiesSnapshot()
  {
    return this._propertiesSnapshot
  }

  get changedPropertiesSnapshot()
  {
    return this._changedPropertiesSnapshot
  }

  get dataModel()
  {
    return this._dataModel
  }
}

export class ActionRequestData<T extends DataModel> extends DataModelRequestData
{
  constructor(dataProvider:DataProvider<DataModel>, dataModel:T, action:string, parameters:ObjectMap, payload:ObjectMap)
  {
    super(dataProvider, dataModel, action)

    this._actionUrl = dataModel.dataProviderConfig.getActionUrlSet().getActionUrl(this.action, dataModel, parameters)
    this._payload = payload
  }
}
