import { DataProvider} from "./DataProvider";
import { DataCollection } from './DataCollection'
import { DataCollectionOptions } from "./DataCollectionOptions";
import { DataModel } from "./DataModel";
import { ObjectMap } from "./ObjectMap";
import { ExternalDataCollectionFactory } from "./ExternalDataCollectionFactory";
import { DataProviderConfigConstructor } from "./DataProviderConfigConstructor";
import { DataModelConstructor } from "./DataModelConstructor";
import { StringOperations } from './StringOperations'
import { QueueWorker } from "./QueueWorker";
import { BackendConnector } from "./BackendConnector";

/**
 * An instance of DataCollectionFactory is used to operate with the core concepts of the data access layer.
 * It provides access to {@link DataCollection|DataCollections} and {@link DataModel|DataModels}
 * 
 * @class DataCollectionFactory
 * @see DataCollection
 * @see DataModel
 */
export class DataCollectionFactory
{
  protected queueWorker:QueueWorker
  protected dataProviders:{[s:string]: DataProvider<DataModel>} = {}
  private _externalDataCollectionFactory:ExternalDataCollectionFactory

  private buildDataProvider<T extends DataModel>(
    dataProviderName:string,
    dataProviderConfigClass:DataProviderConfigConstructor,
    dataModelClass:DataModelConstructor<T>
  ):DataProvider<T>
  {
    dataProviderName = DataCollectionFactory.normalizeName(dataProviderName)
    let dataProvider = this.dataProviders[dataProviderName]

    if (!dataProvider)
    {
      this.dataProviders[dataProviderName] = new DataProvider(this, new dataProviderConfigClass(dataProviderName, this.queueWorker), dataModelClass)
      dataProvider = this.dataProviders[dataProviderName]
    }

    return (dataProvider as DataProvider<T>)
  }

  public createCollection<T extends DataModel>(
    dataProviderName:string,
    dataProviderConfigClass:DataProviderConfigConstructor,
    dataModelClass:DataModelConstructor<T>,
    options?:DataCollectionOptions<T>
  ):DataCollection<T>
  {
    options = options || {}
    return this.buildDataProvider(dataProviderName, dataProviderConfigClass, dataModelClass).createCollection(options) as DataCollection<T>
  }

  public buildInstance<T extends DataModel>(dataProviderName:string, map?:ObjectMap):T
  {
    dataProviderName = DataCollectionFactory.normalizeName(dataProviderName)

    let dataProvider = this.dataProviders[dataProviderName]

    if (!dataProvider)
    {
      throw new Error(`There is no such DataProvider for ${dataProviderName}`)
    }

    return dataProvider.createDataModel(map || {}, true) as T
  }

  /**
   * Attribute accessor for externalDataCollectionFactory
   */
  get externalDataCollectionFactory()
  {
    return this._externalDataCollectionFactory
  }

  public static normalizeName(str:string):string
  {
    return StringOperations.capitalize(StringOperations.removeNonAlphaNumericChars(str))
  }


  constructor(externalDataCollectionFactory:ExternalDataCollectionFactory, backendConnector:BackendConnector)
  {
    this._externalDataCollectionFactory = externalDataCollectionFactory
    this.queueWorker = new QueueWorker(backendConnector)
  }
}
