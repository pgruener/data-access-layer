import { 
  ObjectMap,
  RequestVerb,
  DataModel,
  DataProvider,
  RequestData,
  UnmodifiableDataModelPropertySet,
  ActionUrl } from "./internal";

/**
 * @class DataModelRequestData
 * @extends RequestData
 */
export class DataModelRequestData extends RequestData<DataModel>
{
  protected _propertiesSnapshot:UnmodifiableDataModelPropertySet;
  protected _changedPropertiesSnapshot:UnmodifiableDataModelPropertySet;
  protected _dataModel:DataModel;
  protected _dataForRequest:ObjectMap
  protected readonly action:string | RequestVerb;

  constructor(dataProvider: DataProvider<DataModel>, dataModel:DataModel, action:string|RequestVerb)
  {
    super(dataProvider);

    this._dataModel = dataModel;
    this._dataModel.informAboutDataModelRequestData(this)
    this._propertiesSnapshot = dataModel.originalProperties.unmodifiableClone();
    this._dataForRequest = dataModel.changedProperties.asObjectMap();
    this._dataForRequest = dataModel.dataProviderConfig.prepareForServer(this);
    this._changedPropertiesSnapshot = dataModel.changedProperties.unmodifiableClone() // Must be done AFTER prepared for server
    this.action = action;
    //this._actionUrl = this._dataModel.dataProviderConfig.getActionUrlSet().computeActionUrl(this.action, this._dataModel)
    this._payload = this._dataModel.dataProviderConfig.computePayloadForRequest(this);
  }

  get dataForRequest()
  {
    return this._dataForRequest
  }

  handleResponse(response: ObjectMap)
  {
    super.handleResponse(response);

    if (this.action == 'create')
    {
      this._dataProvider.onAfterNewInstance(this);
    }
    else if (this.action == 'delete') {
      // Fixes a bug who didn't really delete a data modell when you wanted to delete it
      // ! DON'T REMOVE THIS EMPTY BRANCH WITH THIS COMMENT !!!
    }
    else
    {
      this._dataProvider.onAfterUpdate(this);
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

  public getActionUrl = ():ActionUrl => {
    let actionUrl = this._dataModel.dataProviderConfig.getActionUrlSet().computeActionUrl(this.action, this._dataModel)
    return actionUrl
  }
}
