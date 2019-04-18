import { ObjectMap } from "./ObjectMap";
import { DataModel } from "./DataModel";
import { ActionUrl } from "./ActionUrl";
import { DataProvider } from "./DataProvider";

export abstract class RequestData<T>
{
  protected readonly _dataProvider:DataProvider<DataModel>
  protected _actionUrl:ActionUrl
  protected _payload:ObjectMap

  protected _response:ObjectMap|ObjectMap[]

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

  setResponse(response:ObjectMap|ObjectMap[])
  {
    if (this._response)
    {
      throw new Error('Setting response is only possible once.')
    }
    else
    {
      this._response = this._dataProvider.config.unwrapFromServer(this, response)
    }
  }
}
