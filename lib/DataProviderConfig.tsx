import {BackendConnector} from "./BackendConnector";
import ActionUrlSet = require('./ActionUrlSet')
import { DataModel } from './DataModel';
import {ActionUrlConfig} from "./ActionUrlConfig";
import DataProviderScopeSet = require("./DataProviderScopeSet");
import {ObjectMap} from "./ObjectMap";
import { Duration } from "./Duration";
import { DataProviderInitialRequestMoment } from "./DataProviderInitialRequestMoment";

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

  //getLoadedTimeRanges|propertyName... evtl. in Wrapper?!
}
