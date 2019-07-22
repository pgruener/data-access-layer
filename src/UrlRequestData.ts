import { ObjectMap } from "./internal";
import { DataModel } from "./internal";
import { DataProvider } from "./internal";
import { RequestData } from "./internal";

/**
 * @class UrlRequestData
 * @extends RequestData
 */
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
    this._dataProvider.onLoadedData(this);
  }
  
  /**
   * Attribute accessor for scopeName
   */
  get scopeName()
  {
    return this._scopeName;
  }
}
