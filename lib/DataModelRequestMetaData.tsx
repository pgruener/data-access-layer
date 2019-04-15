import { RequestData } from "./RequestData";
import { DataModel } from "./DataModel";

export class DataModelRequestMetaData
{
  private _requestData:RequestData<DataModel>
  constructor(requestData:RequestData<DataModel>)
  {
    this._requestData = requestData
  }

  get requestData()
  {
    return this._requestData
  }
}