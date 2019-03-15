import {BackendConnector} from "./BackendConnector";
import ActionUrlSet = require('./ActionUrlSet')
import { DataModel } from './DataModel';
import {ActionUrlConfig} from "./ActionUrlConfig";
import DataProviderScopeSet = require("./DataProviderScopeSet");
import {ObjectMap} from "./ObjectMap";
import { Duration } from "./Duration";
import { DataProviderInitialRequestMoment } from "./DataProviderInitialRequestMoment";
import {FilterCollection} from "./filter/FilterCollection";
import { DataCollection } from "./DataCollection";
import { DEFAULT_SCOPE_NAME } from './Constants';

export abstract class DataProviderConfig
{
  private _backendConnector:BackendConnector
  private _dataProviderName:string

  constructor(dataProviderName:string, backendConnector:BackendConnector)
  {
    this._dataProviderName = dataProviderName
    this._backendConnector = backendConnector
  }

  public abstract getScopes:() => DataProviderScopeSet

  public getActionUrlConfig = ():ActionUrlConfig =>
  {
    return null
  }

  get dataProviderName():string {
    return this._dataProviderName;
  }

  get backendConnector():BackendConnector {
    return this._backendConnector;
  }

  public getUpdatedAtFieldName = ():string =>
  {
    return 'updated_at'
  }

  public getIdentityRelevantAttributeNames = ():string[] =>
  {
    return [ 'id' ]
  }

  /**
   * The framework only loads data from its data sources, if [FilterRules]{@link FilterRule} are applied,
   * that touch selection relevant attributes or no selection relevant attributes exists.
   * 
   * @method getSelectionRelevantAttributeNames
   * @returns {string[]} attributes may be overwritten by subclasses. Default [ 'id' ]
   */
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

  getRefetchInterval = ():Duration =>
  {
    return new Duration(1000)
  }

  public getActionUrlSet = ():ActionUrlSet =>
  {
    return new ActionUrlSet(this.getActionUrlConfig())
  }

  public prepareForServer = (dataModel:DataModel):ObjectMap => {
    return dataModel.mapDataOut(dataModel.changedProperties)
  }

  public shrinkFilterCollectionForSelection = (filterCollection:FilterCollection<DataModel>):FilterCollection<DataModel> =>
  {
    return null
  }

  /**
   * Handles the decision, if complex selection url computation should get skipped.
   * 
   * @name canSkipSelectionUrlComputation
   * @returns {boolean} <code>true</code>, if computation should be skipped, <code>false</code> otherwise. 
   */
  public canSkipSelectionUrlComputation = ():boolean => {
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
