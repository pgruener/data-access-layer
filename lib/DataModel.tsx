import { DataModelListener } from './DataModelListener'
import { DataProviderConfig } from './DataProviderConfig';
import { DataProvider } from './DataProvider';
import { ObjectMap } from "./ObjectMap";

import { CLIENT_ID_ATTRIBUTE, IDENTITY_HASH_CODE_PROPERTY_NAME } from './Constants';
import { RequestData } from './RequestData';
import { ActionRequestData } from "./ActionRequestData";
import { DataModelRequestMetaData } from './DataModelRequestMetaData';
import { DataModelState } from './DataModelState';

export class DataModel
{
  private listeners:Array<DataModelListener> = new Array()
  private criticalListeners:Array<DataModelListener> = new Array()
  private requestQueue:Array<DataModelRequestMetaData> = []
  
  protected dataProvider:DataProvider<DataModel>
  private properties:ObjectMap
  protected clientChangedProperties:ObjectMap = {}
  private markedForDeletion = false
  private transactionRunning = false
  private instanceNr:number
  private static INSTANCE_COUNTER = 0
  private changeIntervalId:number
  private conflictingModel:DataModel
  private state:DataModelState


  constructor(properties:ObjectMap, dataProvider:DataProvider<DataModel>, isNewInstance?:boolean)
  {
    this.properties = this.mapDataIn(properties)
    this.dataProvider = dataProvider
    this.instanceNr = ++DataModel.INSTANCE_COUNTER

    if (isNewInstance)
    {
      this.setProperty(CLIENT_ID_ATTRIBUTE, 'model_' + Date.now())
    }
  }

  get dataProviderConfig()
  {
    return this.dataProvider.config
  }

  informAboutRequest(requestData:RequestData<DataModel>)
  {
    this.requestQueue.push(new DataModelRequestMetaData(requestData))
  }

  private triggerChangeListeners()
  {
    // console.log('DataModel - trigger listeners', this.instanceNr)

    this.criticalListeners.forEach((listener) => {
      listener.dataModelChanged(this)
    })


    window.clearTimeout(this.changeIntervalId)

    this.changeIntervalId = window.setTimeout(() => {
      this.listeners.forEach((listener) => {
        listener.dataModelChanged(this)
      })
    }, this.dataProvider.config.getChangePropagateWaitDuration().getMilliSeconds())

  }

  public isMarkedForDeletion()
  {
    return this.markedForDeletion
  }

  public beginTransaction()
  {
    this.transactionRunning = true
  }

  public commitTransaction()
  {
    if (this.transactionRunning)
    {
      this.transactionRunning = false
      this.triggerChangeListeners()
    }
  }

  public save()
  {
    if (!this.transactionRunning)
    {
      this.dataProvider.dataModelAsksForSave(this)
    }
  }

  public delete()
  {
    if (!this.markedForDeletion)
    {
      this.markedForDeletion = true
    }
  }

  addListener(listener:DataModelListener, critical?:boolean)
  {
    if (critical)
    {
      this.criticalListeners.push(listener)
    }
    else
    {
      this.listeners.push(listener)
    }
  }

  removeListener(listener:DataModelListener)
  {
    this.removeListenerIntern(listener, this.listeners)
    this.removeListenerIntern(listener, this.criticalListeners)
  }

  private removeListenerIntern(listener:DataModelListener, list:Array<DataModelListener>)
  {
    let index = list.indexOf(listener)
    if (index > -1)
    {
      list.splice(index, 1);
    }
  }
  
  public getProperty<T>(key:string, fallbackValue?:T)
  {
    if (this.clientChangedProperties.hasOwnProperty(key))
    {
      return this.clientChangedProperties[key] as T
    }

    return this.properties[key] as T || fallbackValue
  }

  public getPropertyForFilter(key:string):any
  {
    switch (key)
    {
      case IDENTITY_HASH_CODE_PROPERTY_NAME:
        return this.computeIdentityHashCode()

      default:
        return this.getProperty(key)
    }
  }

  public isPersisted():boolean
  {
    let isPersisted = true

    let identityRelevantAttributeNames = this.dataProvider.config.getIdentityRelevantAttributeNames()
    identityRelevantAttributeNames.forEach((attributeName) => {
      isPersisted = isPersisted && this.hasProperty(attributeName)
    })

    return isPersisted
  }

  removeProperty(key:string)
  {
    delete this.clientChangedProperties[key]
    delete this.properties[key]
    this.triggerChangeListeners()
  }

  resetChanges()
  {
    this.clientChangedProperties = {}
    this.triggerChangeListeners()
  }

  removePropertyChange(key:string)
  {
    delete this.clientChangedProperties[key]
    this.triggerChangeListeners()
  }

  public hasProperty(key:string):boolean
  {
    return this.getProperty(key) !== undefined
  }

  public setProperty(key:string, value:Object, skipTriggerListeners?:boolean):boolean
  {
    let changed = this.properties[key] !== value || this.clientChangedProperties[key] !== value

    if (changed)
    {
      this.clientChangedProperties[key] = value

      if (!skipTriggerListeners)
      {
        this.triggerChangeListeners()
      }
    }

    return changed
  }

  public setProperties(map:ObjectMap, shouldClearProperties?:boolean)
  {
    if (shouldClearProperties)
    {
      this.properties = {}
    }

    let anythingChanged = false

    for (var key in map)
    {
      anythingChanged = this.setProperty(key, map[key], true) || anythingChanged
    }

    if (anythingChanged)
    {
      this.triggerChangeListeners()
    }
  }

  get originalProperties():ObjectMap
  {
    return this.properties
  }


  get changedProperties():ObjectMap
  {
    return this.clientChangedProperties
  }

  protected mapDataIn(objectMap:ObjectMap):ObjectMap
  {
    return objectMap
  }

  public mapDataOut(objectMap:ObjectMap):ObjectMap
  {
    return objectMap
  }

  private hasChanges()
  {
    return Object.keys(this.changedProperties).length > 0
  }

  public hasConflict()
  {
    return this.conflictingModel != undefined
  }

  private setConflict(conflictingModel:DataModel)
  {
    this.conflictingModel = conflictingModel
  }

  mergeModel<T extends DataModel>(dataModel:T)
  {
    let updatedAtProperty = this.dataProvider.config.getUpdatedAtAttributeName()

    if (new Date(this.getProperty(updatedAtProperty)) < new Date(dataModel.getProperty(updatedAtProperty)))
    {
      if (this.hasChanges())
      {
        this.setConflict(dataModel)
      }
      else
      {
        this.setProperties(dataModel.properties, true)
      }
    }
  }

  private shouldMerge = (objectMap:ObjectMap):boolean =>
  {
    let updatedAtFieldKey = this.dataProvider.config.getUpdatedAtAttributeName()
    if (!this.hasProperty(updatedAtFieldKey))
    {
      return true
    }

    return new Date(this.getProperty(updatedAtFieldKey)) < new Date(objectMap[updatedAtFieldKey].toString())
  }

  mergeChanges(objectMap:ObjectMap)
  {
    objectMap = this.mapDataIn(objectMap)

    let anythingChanged = false

    let shouldMerge = this.shouldMerge(objectMap)
    
    if (shouldMerge)
    {
      Object.keys(objectMap).forEach((key) => {
        if (this.properties[key] != objectMap[key])
        {
          delete this.clientChangedProperties[key]
  
          this.properties[key] = objectMap[key]
          anythingChanged = true
        }
      })
    }


    if (anythingChanged)
    {
      this.triggerChangeListeners()
    }
  }

  /**
   * Returns this models identityHashCode
   * @method computeIdentityHashCode
   * @return {string} identityHashCode
   * @see {DataModel.computeIdentityHashCode}
   */
  computeIdentityHashCode():string
  {
    return DataModel.computeIdentityHashCode(this, this.dataProvider.config)
  }

  public performAction = (action:string, actionVariables:ObjectMap, payload:ObjectMap) =>
  {
    this.dataProvider.doRequest(new ActionRequestData(this.dataProvider, this, action, actionVariables, payload))
  }

  /**
   * Computes the identityHashCode for the given dataModel or object.
   * The identiyHashCode identifies one DataModel bijectivly.
   * 
   * An identiy hash code is prefixed by its model name and its contains its
   * identity relevant attributes seperated by underscore. (i.e.: milestone_5)
   * 
   * @method computeIdentityHashCode
   * @static
   * @param {DataModel} dataModel 
   * @param {DataProviderConfig} dataProviderConfig 
   * @return {string} identityHashCode
   * @see {DataProviderConfig.getIdentityRelevantAttributeNames}
   */
  public static computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string
  {
    let identityHashCode = dataProviderConfig.dataProviderName + '_'

    let attributeNames = dataProviderConfig.getIdentityRelevantAttributeNames()

    attributeNames.push(CLIENT_ID_ATTRIBUTE)

    attributeNames.forEach((attributeName:string, index:number) => {
      if (index != 0)
      {
        identityHashCode += '_'
      }

      if (dataModel instanceof DataModel)
      {
        identityHashCode += dataModel.getProperty(attributeName)
      }
      else
      {
        identityHashCode += dataModel[attributeName]
      }
    })

    return identityHashCode
  }

  public getFootprint():string
  {
    let footprint = ''

    Object.keys(this.properties).sort().forEach((key, index:number) => {

      if (index != 0)
      {
        footprint += '_'
      }

      footprint += key + this.properties[key]
    })

    return footprint
  }
}
