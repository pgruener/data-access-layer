import {DataCollection} from './DataCollection'
import RootDataCollection = require('./RootDataCollection')
import {DataProviderConfig} from './DataProviderConfig'
import DataCollectionChangeProvider = require('./DataCollectionChangeProvider')
import DataCollectionChangeListener = require('./DataCollectionChangeListener')
import { DataCollectionOptions } from './DataCollectionOptions'
import {DataCollectionFactory} from './DataCollectionFactory';
import {ObjectMap} from "./ObjectMap";
import DataProviderState = require('./DataProviderState');
import ActionUrl = require('./ActionUrl');
import { DataModel } from './DataModel';
import { DEFAULT_SCOPE_NAME, CLIENT_ID_ATTRIBUTE } from './Constants';

export class DataProvider<T extends DataModel> implements DataCollectionChangeProvider<T>, DataCollectionChangeListener<T> {
  private _state:DataProviderState = 'not_inited'
  private _config:DataProviderConfig
  private rootDataCollectionsByScope:{[scope:string]: RootDataCollection<T>} = {}
  private dataCollectionFactory:DataCollectionFactory

  private allEntities:{[s: string]: T} = {}
  private changeListeners:Array<DataCollectionChangeListener<T>> = new Array()
  private dataModelClass:{ new(properties:ObjectMap, dataProvider:DataProvider<DataModel>, isNewInstance?:boolean): T, computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string }

  
  constructor(dataCollectionFactory:DataCollectionFactory, config:DataProviderConfig, dataModelClass:{ new(properties:ObjectMap): T, computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string })
  {
    this.dataCollectionFactory = dataCollectionFactory
    this._config = config
    this.dataModelClass = dataModelClass
  }


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
    let scopeOrUrl = this.config.getScopes()[scopeName]

    let url

    if (typeof scopeOrUrl == 'string')
    {
      url = scopeOrUrl as string
    }
    else
    {
      url = (scopeOrUrl as {url:string})['url']

      let initialEntities = (scopeOrUrl as {initialEntities:[ObjectMap]})['initialEntities']

      if (initialEntities)
      {
        initialEntities.forEach((objectMap) => {
          this.createDataModel(objectMap)
        })

        // TODO: Wie kriegen diese initialen Einträge aus dem JSON die Verbindung zu einem Scope?
      }
    }

    if (url)
    {
      url = this.config.computeSelectionUrl(url, collection)

      this.config.backendConnector.get<ObjectMap[]>(url).done((objectMaps:ObjectMap[]) => {

        let entities = new Array()
  
        if (objectMaps)
        {
          objectMaps.forEach((objectMap) => {
            entities.push(this.createDataModel(objectMap))
          })
        }
  
        // FIXME: Instead mergeEntities
        this.buildRootDataCollection(scopeName).setEntities(entities)
      })
    }
  }

  public delete(dataModel:DataModel)
  {
    let identityHashCode = dataModel.computeIdentityHashCode()
    this.deleteIntern(identityHashCode)

    let destroyUrl:ActionUrl = this.config.getActionUrlSet().getActionUrl('destroy', dataModel)

    if (destroyUrl)
    {
      this.doServerRequest(destroyUrl, {}, (objectMap:ObjectMap) => {
        this.deleteIntern(identityHashCode)
      })

      // TODO: What to do, if deletion fails on server side?
    }
    else
    {
      throw new Error(`There is no destroy possible for ${this.config.dataProviderName}`)
    }
  }

  private deleteIntern(identityHashCode:string)
  {
    if (this.allEntities[identityHashCode])
    {
      delete this.allEntities[identityHashCode]
  
      Object.keys(this.rootDataCollectionsByScope).forEach((key) => {

        // FIXME: This MUST be done by using remove instead writing ALL entities to every scope
        this.rootDataCollectionsByScope[key].setEntities(this.getAllEntities())
      })
    }
  }

  getAllEntities():T[]
  {
    let dataModels:T[] = []

    Object.keys(this.allEntities).forEach((key) => {
      dataModels.push(this.allEntities[key])
    })

    return dataModels
  }

  public find<T extends DataModel>(dataProviderName:string, searchMap:ObjectMap|string):T
  {
    return this.dataCollectionFactory.getExternalDataCollectionFactory().find(dataProviderName, searchMap)
  }

  private writeInstanceToServer(dataModel:T)
  {
    let createUrl:ActionUrl = this.config.getActionUrlSet().getActionUrl('create', dataModel)

    if (createUrl)
    {
      let payload = this.config.prepareForServer(dataModel)

      this.doServerRequest(createUrl, payload, (objectMaps:ObjectMap) => {
        dataModel.mergeChanges(objectMaps)

        delete this.allEntities[CLIENT_ID_ATTRIBUTE]
        dataModel.removeProperty(CLIENT_ID_ATTRIBUTE)

        this.allEntities[dataModel.computeIdentityHashCode()] = dataModel
      })
    }
    else
    {
      throw new Error(`There is no update possible for ${this.config.dataProviderName}`)
    }
  }

  private tryWriteChangeToServer(dataModel:DataModel)
  {
    let updateUrl:ActionUrl = this.config.getActionUrlSet().getActionUrl('update', dataModel)

    if (updateUrl)
    {
      let payload = this.config.prepareForServer(dataModel)
  
      this.doServerRequest(updateUrl, payload, (objectMaps:ObjectMap|ObjectMap[]) => {

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
      })
    }
    else
    {
      throw new Error(`There is no update possible for ${this.config.dataProviderName}`)
    }
  }

  public doServerRequest(actionUrl:ActionUrl, payload:ObjectMap, callback:(object:Object) => void)
  {
    let backendConnector = this.config.backendConnector
    let apiMethod = backendConnector.getConcreteRequestMethod(actionUrl.method)

    apiMethod.apply(backendConnector, [actionUrl.url, payload]).done(callback)
  }


  public createDataModel(objectMap:ObjectMap, isBuild?:boolean):T
  {
    let identityHashCode = this.dataModelClass.computeIdentityHashCode(objectMap, this.config)
    
    let dataModel = this.allEntities[identityHashCode]

    if (!dataModel)
    {
      dataModel = new this.dataModelClass(objectMap, this, isBuild)
      identityHashCode = dataModel.computeIdentityHashCode()

      this.allEntities[identityHashCode] = dataModel

      if (isBuild)
      {
        this.config.getNewInstanceDataModelScopeNames().forEach((scopeName) => {
          this.buildRootDataCollection(scopeName).addDataModel(dataModel)
        })
      }
    }
    else
    {
      dataModel.mergeChanges(objectMap)
    }

    return dataModel
  }

  dataModelAsksForSave(dataModel:T)
  {
    if (dataModel.isMarkedForDeletion())
    {
      this.delete(dataModel)
    }
    else if (dataModel.hasProperty(CLIENT_ID_ATTRIBUTE))
    {
      this.writeInstanceToServer(dataModel)
    }
    else
    {
      this.tryWriteChangeToServer(dataModel)
    }
  }


  private buildRootDataCollection(scopeName:string)
  {
    if (!this.hasRootDataCollection(scopeName))
    {
      this.rootDataCollectionsByScope[scopeName] = new RootDataCollection({ dataProvider: this, changeProvider: this, scope: scopeName })
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
      initialEntities: rootDataCollection.getFilteredDataModels(),
      changeListener: options.dataCollectionChangeListener
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
