import { RequestData } from "./internal";
import { DataModel } from "./internal";

/**
 * @class DataModelRequestMetaData
 */
export class DataModelRequestMetaData
{
  private _requestData:RequestData<DataModel>
  constructor(requestData:RequestData<DataModel>)
  {
    this._requestData = requestData
  }

  /**
   * Attribute accessor for requestData
   */
  get requestData()
  {
    return this._requestData
  }
}