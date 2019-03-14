import {BackendConnector} from "./BackendConnector";
import ActionUrlSet = require('./ActionUrlSet')
import { DataModel } from './DataModel';
import {ActionUrlConfig} from "./ActionUrlConfig";
import DataProviderScopeSet = require("./DataProviderScopeSet");
import {ObjectMap} from "./ObjectMap";
import { Duration } from "./Duration";
import { DataProviderInitialRequestMoment } from "./DataProviderInitialRequestMoment";
import FilterCollection = require("./FilterCollection");
import { DataCollection } from "./DataCollection";

const DEFAULT_SCOPE_NAME = 'index'

export abstract class DataProviderConfig
{
  private backendConnector:BackendConnector
  private dataProviderName:string

  constructor(dataProviderName:string, backendConnector:BackendConnector)
  {
    this.dataProviderName = dataProviderName
    this.backendConnector = backendConnector
  }

  public abstract getScopes:() => DataProviderScopeSet

  public getActionUrlConfig = ():ActionUrlConfig =>
  {
    return null
  }

  getDataProviderName():string
  {
    return this.dataProviderName
  }

  getBackendConnector():BackendConnector
  {
    return this.backendConnector
  }

  public getUpdatedAtFieldName = ():string =>
  {
    return 'updated_at'
  }

  public getIdentityRelevantAttributeNames = ():string[] =>
  {
    return [ 'id' ]
  }

  public getSelectionRelevantAttributeNames = ():string[] =>
  {
    return [ 'id' ]
  }

  public getNewInstanceDataModelScopeNames = ():string[] =>
  {
    return [ DEFAULT_SCOPE_NAME ]
  }

  getInitialRequestMoment = ():DataProviderInitialRequestMoment => {
    return 'on_first_collection'
  }

  public getDataLifetime = ():Duration => {
    return new Duration(1000)
  }

  public getRefetchInterval = ():Duration =>
  {
    return new Duration(1000)
  }

  public getActionUrlSet = ():ActionUrlSet =>
  {
    return new ActionUrlSet(this.getActionUrlConfig())
  }

  public prepareForServer = (dataModel:DataModel):ObjectMap => {
    return dataModel.mapDataOut(dataModel.getChangedProperties())
  }

  public shrinkFilterCollectionForSelection = (filterCollection:FilterCollection<DataModel>):FilterCollection<DataModel> =>
  {
    return null
  }

  private canSkipSelectionUrlComputation = ():boolean => {
    let attributeNames = this.getSelectionRelevantAttributeNames()
    return attributeNames == undefined || attributeNames == null || attributeNames.length == 0
  }

  public computeSelectionUrl = <T extends DataModel>(url:string, selectionTriggerCollection:DataCollection<T>):string => {

    if (this.canSkipSelectionUrlComputation())
    {
      return url
    }

    let dateBegin = new Date(2019,2,14,0,0,0,0)
    let dateEnd = new Date(2019,2,15,0,0,0,0)

    return url.replace('${date_begin}', dateBegin.toString()).replace('${date_end}', dateEnd.toString())
  }

  /**
   * Retuns the duration, a {DataModel} should wait until it propagates changes to its listeners.
   * The time resets after every change. 
   * 
   * Critical listeners do not respect this value. 
   * @name getChangePropagateWaitDuration
   * @returns {Duration} 
   */
  public getChangePropagateWaitDuration():Duration
  {
    return new Duration(100)
  }

  //getLoadedTimeRanges|propertyName... evtl. in Wrapper?!
}
