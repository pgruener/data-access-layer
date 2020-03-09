import { ObjectMap } from "./internal";
import { DataModel } from "./internal";
import { ActionUrl } from "./internal";
import { DataProvider } from "./internal";
import { RequestDataStatus } from './internal'

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
  private static requestDataIdCounter: number = 0
  protected readonly _dataProvider:DataProvider<DataModel>
  protected _actionUrl:ActionUrl
  protected _payload:ObjectMap

  protected _response:ObjectMap|ObjectMap[]

  protected status: RequestDataStatus = 'pending'
  protected retryable: boolean = false
  protected retryAmount: number = 0
  private clientTimestamp: Date = new Date()

  // https://gist.github.com/gordonbrander/2230317
  private _id = Math.random().toString(36).substr(2, 9) + '_' + this.clientTimestamp.getTime() + '_' + RequestData.requestDataIdCounter

  constructor(dataProvider:DataProvider<DataModel>)
  {
    this._dataProvider = dataProvider
    ++RequestData.requestDataIdCounter
  }

  public getActionUrl = () =>
  {
    return this._actionUrl
  }

  public computePayload = () =>
  {
    return this._payload
  }

  public setActive = ():void => {
    this.setRetryable(false)
    if (this.isPending()) {
      this.status = 'active'
    } else if (this.isError()) {
      this.status = 'active'
      ++this.retryAmount
    }
  }

  public isPending = ():boolean => this.status == 'pending'

  public isError = ():boolean => this.status == 'error'

  public isActive = ():boolean => this.status == 'active'

  public isFinished = ():boolean => this.status == 'finished'

  public setFinished = ():void => {
    this.status = 'finished'
  }

  public setRetryable = (retryable: boolean):void => {
    this.retryable = retryable
  }

  public isRetryable = ():boolean => this.retryable && this.retryAmount < 100

  public setError = ():void => {
    this.status = 'error'
  }

  public calculateRetryWaitTime = ():number => this.retryAmount * 500

  public get RetryAmount():number {
    return this.retryAmount
  }

  public get Status():RequestDataStatus {
    return this.status
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

  public setClientTimestamp = ():void => {
    this.clientTimestamp = new Date()
  }

  public get ClientTimestamp():Date {
    return new Date(this.clientTimestamp.getTime())
  }

  public get id():string {
    return this._id
  }
}
