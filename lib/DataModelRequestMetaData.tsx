import { RequestData } from "./RequestData";
import { DataModel } from "./DataModel";

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