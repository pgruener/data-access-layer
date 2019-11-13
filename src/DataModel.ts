import { DataModelListener } from './internal'
import { DataProviderConfig } from './internal';
import { DataProvider } from './internal';
import { ObjectMap } from "./internal";

import { CLIENT_ID_ATTRIBUTE, IDENTITY_HASH_CODE_PROPERTY_NAME } from './internal';
import { RequestData } from './internal';
import { ActionRequestData } from "./internal";
import { DataModelRequestMetaData } from './internal';
import { DataModelState } from './internal';
import { DataModelPropertySet } from './internal';
import { DataModelRequestData } from './internal';

export class DataModel
{
  private listeners:Array<DataModelListener> = new Array()
  private criticalListeners:Array<DataModelListener> = new Array()
  private requestQueue:Array<DataModelRequestMetaData> = []
  
  protected dataProvider:DataProvider<DataModel>
  private properties:DataModelPropertySet
  protected clientChangedProperties:DataModelPropertySet = new DataModelPropertySet()
  private markedForDeletion = false
  private transactionRunning = false
  private instanceNr:number
  private static INSTANCE_COUNTER = 0
  private changeIntervalId:number
  private conflictingModel:DataModel
  private state:DataModelState


  constructor(properties:ObjectMap, dataProvider:DataProvider<DataModel>, isNewInstance?:boolean)
  {
    this.properties =  new DataModelPropertySet(this.mapDataIn(properties))
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
    this.criticalListeners.forEach((listener) => {
      listener.dataModelChanged(this)
    })


    window.clearTimeout(this.changeIntervalId)

    this.changeIntervalId = window.setTimeout(() => {
      this.listeners.forEach((listener) => {
        listener.dataModelChanged(this)
      })
    }, this.dataProvider.config.getChangePropagateWaitDuration().milliSeconds)

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
  
  public getProperty<T>(propertyName:string, fallbackValue?:T)
  {
    if (this.clientChangedProperties.hasProperty(propertyName))
    {
      return this.clientChangedProperties.getValue<T>(propertyName)
    }

    return this.properties.getValue<T>(propertyName) || fallbackValue
  }

  public getPropertyForFilter(propertyName:string):any
  {
    switch (propertyName)
    {
      case IDENTITY_HASH_CODE_PROPERTY_NAME:
        return this.computeIdentityHashCode()

      default:
        return this.getProperty(propertyName)
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

  removeProperty(propertyName:string)
  {
    this.clientChangedProperties.removeProperty(propertyName)
    this.properties.removeProperty(propertyName)
    this.triggerChangeListeners()
  }

  resetChanges()
  {
    this.clientChangedProperties.clear()
    this.triggerChangeListeners()
  }

  removePropertyChange(propertyName:string)
  {
    this.clientChangedProperties.removeProperty(propertyName)
    this.triggerChangeListeners()
  }

  public hasProperty(propertyName:string):boolean
  {
    return this.getProperty(propertyName) !== undefined
  }

  public setProperty(propertyName:string, value:Object, skipTriggerListeners?:boolean):boolean
  {
    if (this.isMarkedForDeletion())
    {
      throw new Error(`You tried to set a property '${propertyName}' of a datModel ${this} which is already marked for deletion. This is inappropriate.`)
    }

    let changed = !this.properties.hasProperty(propertyName, value) || !this.clientChangedProperties.hasProperty(propertyName, value)

    if (changed)
    {
      this.clientChangedProperties.set(propertyName, value)

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
      this.properties.clear()
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

  get originalProperties():DataModelPropertySet
  {
    return this.properties
  }


  get changedProperties():DataModelPropertySet
  {
    return this.clientChangedProperties
  }

  protected mapDataIn(/*requestData:DataModelRequestData<DataModel>, */objectMap:ObjectMap):ObjectMap
  {
    return objectMap
  }

  public mapDataOut(requestData:DataModelRequestData):ObjectMap
  {
    return requestData.dataForRequest
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
        this.setProperties(dataModel.properties.exportAsObjectMap(), true)
      }
    }
  }

  private shouldMerge = (objectMap:ObjectMap):boolean =>
  {
    let updatedAtAttributeName = this.dataProvider.config.getUpdatedAtAttributeName()
    if (!this.hasProperty(updatedAtAttributeName))
    {
      return true
    }
    return new Date(this.getProperty(updatedAtAttributeName)).getTime() < new Date(objectMap[updatedAtAttributeName].toString()).getTime()
  }

  mergeChanges(objectMap:ObjectMap)
  {
    objectMap = this.mapDataIn(objectMap)
    let anythingChanged = false

    let shouldMerge = this.shouldMerge(objectMap)
    
    if (shouldMerge)
    {
      Object.keys(objectMap).forEach((propertyName) => {
        if (!this.properties.hasProperty(propertyName, objectMap[propertyName]))
        {
          this.clientChangedProperties.removeProperty(propertyName)
  
          this.properties.set(propertyName, objectMap[propertyName])
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
  computeIdentityHashCode(computeOnlyWithClientIdAttribute?: boolean):string
  {
    return DataModel.computeIdentityHashCode(this, this.dataProvider.config, computeOnlyWithClientIdAttribute)
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
  public static computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig, computeOnlyWithClientIdAttribute?: boolean):string
  {
    let identityHashCode = dataProviderConfig.dataProviderName
    // debugger
    let attributeNames = computeOnlyWithClientIdAttribute ? [] : dataProviderConfig.getIdentityRelevantAttributeNames()

    attributeNames.push(CLIENT_ID_ATTRIBUTE)

    attributeNames.forEach((attributeName:string, index:number) => {
      let identityHashCodePart: string
      if (dataModel instanceof DataModel)
      {
        // debugger
        identityHashCodePart = dataModel.getProperty(attributeName) || ''
      }
      else
      {
        identityHashCodePart = dataModel[attributeName] as string || ''
      }
      if (identityHashCodePart)
      {
        identityHashCode += '_'
      }
      identityHashCode += identityHashCodePart
    })

    return identityHashCode
  }
}
