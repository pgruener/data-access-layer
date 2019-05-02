import { ObjectMap } from "./internal";
import { DataModel } from "./internal";
import { ActionUrl } from "./internal";
import { DataProvider } from "./internal";

/**
 * RequestData contains every information needed for a {@link BackendConnector} to decide,
 * what kind of request to the backend (i.e. server, local storage, ...) is needed th perform the
 * desired action. It acts as a container object and delegates the backends response to the
 * interested internal code.
 * 
 * There are some specific subclasses of RequestData, which differentiate the behavior.
 * 
 * @class RequestData
 * @see BackendConnector
 * @see UrlRequestData
 * @see ActionRequestData
 */
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

  /**
   * Sets response and triggers further internal usage.
   * 
   * @method handleResponse
   * @param {ObjectMap|ObjectMap[]} response 
   */
  handleResponse(response:ObjectMap|ObjectMap[])
  {
    if (this._response)
    {
      throw new Error('Handling response is only possible once.')
    }
    else
    {
      this._response = this._dataProvider.config.unwrapFromServer(this, response)
    }
  }

  /**
   * Attribute accessor for response
   */
  get response()
  {
    return this._response as ObjectMap|ObjectMap[]
  }
}
