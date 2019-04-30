import { DataCollection } from './DataCollection'
import { RootDataCollection } from './RootDataCollection'
import { DataProviderConfig } from './DataProviderConfig'
import { DataCollectionChangeProvider } from './DataCollectionChangeProvider'
import { DataCollectionChangeListener } from './DataCollectionChangeListener'
import { DataCollectionOptions } from './DataCollectionOptions'
import { DataCollectionFactory } from './DataCollectionFactory';
import { ObjectMap } from "./ObjectMap";
import { DataProviderState } from './DataProviderState';
import { DataModel } from './DataModel';
import { DEFAULT_SCOPE_NAME, CLIENT_ID_ATTRIBUTE } from './Constants';
import { RequestData } from './RequestData';
import { DataModelRequestData } from "./DataModelRequestData";
import { UrlRequestData } from "./UrlRequestData";
import { RequestVerb } from './RequestVerb';

export class DataProvider<T extends DataModel> implements DataCollectionChangeProvider<T>, DataCollectionChangeListener<T> {
  private _state:DataProviderState = 'not_inited'
  private _config:DataProviderConfig
  private rootDataCollectionsByScope:{[scope:string]: RootDataCollection<T>} = {}
  private dataCollectionFactory:DataCollectionFactory

  private _allEntities:{[s: string]: T} = {}
  private changeListeners:Array<DataCollectionChangeListener<T>> = new Array()
  private dataModelClass:{ new(properties:ObjectMap, dataProvider:DataProvider<DataModel>, isNewInstance?:boolean): T, computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string }

  private requestCacheTimeouts:{ [url:string]: number } = {}

  
  constructor(dataCollectionFactory:DataCollectionFactory, config:DataProviderConfig, dataModelClass:{ new(properties:ObjectMap): T, computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string })
  {
    this.dataCollectionFactory = dataCollectionFactory
    this._config = config
    this.dataModelClass = dataModelClass
  }

  /**
   * Attribute accessor to retreive {@link DataProviderConfig}
   */
  get config():DataProviderConfig
  {
    return this._config
  }

  dataCollectionChanged(dataCollection:DataCollection<T>)
  {
    this.changeListeners.forEach((listener) => {
      listener.dataCollectionChanged(dataCollection)
    })
  }

  get state():DataProviderState
  {
    return this._state
  }

  public addChangeListener(listener:DataCollectionChangeListener<T>)
  {
    this.changeListeners.push(listener)
  }

  public removeChangeListener(listener:DataCollectionChangeListener<T>)
  {
    let index = this.changeListeners.indexOf(listener)
    if (index > -1)
    {
      this.changeListeners.splice(index, 1 ); 
    }
  }

  private loadData(scopeName:string, collection?:DataCollection<T>)
  {
    if (this.config.hasUrl(scopeName))
    {
      let initialEntities = this.config.getInitialEntities(scopeName)

      if (initialEntities)
      {
        initialEntities.forEach((objectMap) => {
          this.createDataModel(objectMap)
        })
  
        // TODO: Wie kriegen diese initialen Einträge aus dem JSON die Verbindung zu einem Scope?
      }

      let url = this.config.computeSelectionUrl(scopeName, collection)

      if (this.shouldLoadData(url, collection))
      {
        this.requestCacheTimeouts[url] = Date.now() + this.config.getDataCacheLifetime().milliSeconds
        this.config.queueWorker.doRequest(new UrlRequestData(this, url, scopeName))
      }
    }
  }

  onLoadedData(urlRequestData:UrlRequestData)
  {
    let objectMaps = urlRequestData.response as ObjectMap[]
    if (objectMaps)
    {
      let entities = new Array()

      objectMaps.forEach((objectMap) => {
        entities.push(this.createDataModel(objectMap))
      })

      this.buildRootDataCollection(urlRequestData.scopeName).mergeEntities(entities)
    }
  }

  private shouldLoadData(url:string, selectionTriggerCollection:DataCollection<T>):boolean
  {
    if (url == null)
    {
      return false
    }
    
    let timeout:number = this.requestCacheTimeouts[url]
    
    if (!timeout)
    {
      return true
    }

    return Date.now() > timeout
  }


  private onBeforeDelete(dataModel:T)
  {
    this.deleteIntern(dataModel.computeIdentityHashCode())
  }


  public onAfterDelete(dataModel:T)
  {
    this.deleteIntern(dataModel.computeIdentityHashCode())
  }

  private deleteIntern(identityHashCode:string)
  {
    if (this._allEntities[identityHashCode])
    {
      delete this._allEntities[identityHashCode]
  
      Object.keys(this.rootDataCollectionsByScope).forEach((key) => {

        // FIXME: This MUST be done by using remove instead writing ALL entities to every scope
        this.rootDataCollectionsByScope[key].setEntities(this.allEntities)
      })
    }
  }

  get allEntities():T[]
  {
    let dataModels:T[] = []

    Object.keys(this._allEntities).forEach((key) => {
      dataModels.push(this._allEntities[key])
    })

    return dataModels
  }

  public find<T extends DataModel>(dataProviderName:string, searchMap:ObjectMap|string):T
  {
    return this.dataCollectionFactory.externalDataCollectionFactory.find(dataProviderName, searchMap)
  }


  public onAfterNewInstance = (dataModelRequestData:DataModelRequestData) => {

    let dataModel = dataModelRequestData.dataModel as T
    let objectMaps = dataModelRequestData.response as ObjectMap

    dataModel.mergeChanges(objectMaps)

    delete this._allEntities[CLIENT_ID_ATTRIBUTE]
    dataModel.removeProperty(CLIENT_ID_ATTRIBUTE)

    this._allEntities[dataModel.computeIdentityHashCode()] = dataModel
  }

  public onAfterUpdate = (dataModelRequestData:DataModelRequestData) => {

    let objectMaps = dataModelRequestData.response as ObjectMap|ObjectMap[]

    if (objectMaps.constructor == Array)
    {
      (objectMaps as ObjectMap[]).forEach((objectMap:ObjectMap) => {
        this.createDataModel(objectMap)
      })
    }
    else
    {
      this.createDataModel(objectMaps as ObjectMap)
    }
  }

  public doRequest(requestData:RequestData<T>)
  {
    let queueName = this.config.getBackendConnectorQueueName()
    this.config.queueWorker.doRequest(requestData, queueName)
  }

  public createDataModel(objectMap:ObjectMap, isBuild?:boolean):T
  {
    let identityHashCode = this.dataModelClass.computeIdentityHashCode(objectMap, this.config)
    
    let dataModel = this._allEntities[identityHashCode]

    if (!dataModel)
    {
      dataModel = new this.dataModelClass(objectMap, this, isBuild)
      identityHashCode = dataModel.computeIdentityHashCode()

      this._allEntities[identityHashCode] = dataModel

      if (isBuild)
      {
        this.config.getNewInstanceDataModelScopeNames().forEach((scopeName) => {
          this.buildRootDataCollection(scopeName).addDataModel(dataModel)
        })
      }
    }
    else
    {
      if (!this.config.shouldSurpressIdentityHashCodeWarning() && identityHashCode == this.dataModelClass.computeIdentityHashCode({}, this.config))
      {
        console.warn(`It seems like you forgot implement getIdentityRelevantAttributeNames correctly for ${this.config.dataProviderName}, but received ${dataModel} in your DataProviderConfig subclass.`)
      }

      dataModel.mergeChanges(objectMap)
    }

    return dataModel
  }

  private computeRequestVerb(dataModel:T):RequestVerb
  {
    if (dataModel.isMarkedForDeletion())
    {
      return 'delete'
    }
    else if (dataModel.hasProperty(CLIENT_ID_ATTRIBUTE))
    {
      return 'create'
    }
    else
    {
      return 'update'
    }
  }

  dataModelAsksForSave(dataModel:T)
  {
    let requestVerb:RequestVerb = this.computeRequestVerb(dataModel)

    if (requestVerb == 'delete')
    {
      this.onBeforeDelete(dataModel)
    }

    this.doRequest(new DataModelRequestData(this, dataModel, requestVerb))
  }


  private buildRootDataCollection(scopeName:string)
  {
    scopeName = scopeName || DEFAULT_SCOPE_NAME

    if (!this.hasRootDataCollection(scopeName))
    {
      this.rootDataCollectionsByScope[scopeName] = new RootDataCollection({ dataProvider: this, changeProvider: this, scope: scopeName, topCollection: null })
    }

    return this.rootDataCollectionsByScope[scopeName]
  }

  private hasRootDataCollection(scopeName:string):boolean
  {
    return this.rootDataCollectionsByScope.hasOwnProperty(scopeName)
  }

  createCollection(options:DataCollectionOptions<T>):DataCollection<T>
  {
    if (!options.scope)
    {
      options.scope = DEFAULT_SCOPE_NAME
    }

    let shouldLoad = (this.config.getInitialRequestMoment() == 'on_first_collection') && !this.hasRootDataCollection(options.scope)

    let rootDataCollection = this.buildRootDataCollection(options.scope)

    let dataCollection:DataCollection<T> = new DataCollection({
      dataProvider: this,
      changeProvider: rootDataCollection,
      scope: options.scope,
      initialEntities: rootDataCollection.getEntities(),
      changeListener: options.dataCollectionChangeListener,
      topCollection: null
    })

    if (shouldLoad)
    {
      this.loadData(options.scope)
    }

    return dataCollection
  }

  filtersChanged(scope:string, collection:DataCollection<T>)
  {
    this.loadData(scope, collection)
  }
}
