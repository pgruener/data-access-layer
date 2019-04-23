import { ObjectMap } from "./ObjectMap";
import { DataModel } from "./DataModel";
import { DataProvider } from "./DataProvider";
import { RequestData } from "./RequestData";

export class UrlRequestData extends RequestData<Object>
{
  private _scopeName: string;
  
  constructor(dataProvider: DataProvider<DataModel>, url: string, scopeName: string)
  {
    super(dataProvider);
    this._actionUrl = { url: url, method: 'GET' };
    this._scopeName = scopeName;
  }
  
  handleResponse(response: ObjectMap[])
  {
    super.handleResponse(response);
    this._dataProvider.onLoadedData(this._scopeName, this._response as ObjectMap[]);
  }
  
  /**
   * Attribute accessor for scopeName
   */
  get scopeName()
  {
    return this._scopeName;
  }
}
