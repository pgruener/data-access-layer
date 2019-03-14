import DataModelListener = require('./DataModelListener')
import {DataProviderConfig} from './DataProviderConfig';
import {DataProvider} from './DataProvider';
import {ObjectMap} from "./ObjectMap";

const CLIENT_ID_ATTRIBUTE = 'data-access-layer___client___id'
const CHANGE_PROPAGATE_WAIT_MILLIS = 100

export class DataModel
{
  private listeners:Array<DataModelListener> = new Array()
  private criticalListeners:Array<DataModelListener> = new Array()
  
  protected dataProvider:DataProvider<DataModel>
  private properties:ObjectMap
  protected clientChangedProperties:ObjectMap = {}
  private markedForDeletion = false
  private transactionRunning = false
  private instanceNr:number
  private static INSTANCE_COUNTER = 0
  private changeIntervalId:number


  constructor(properties:ObjectMap, dataProvider:DataProvider<DataModel>, isNewInstance?:boolean)
  {
    this.properties = properties
    this.dataProvider = dataProvider
    this.instanceNr = ++DataModel.INSTANCE_COUNTER

    if (isNewInstance)
    {
      this.setProperty(CLIENT_ID_ATTRIBUTE, 'model_' + Date.now())
    }
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
    }, CHANGE_PROPAGATE_WAIT_MILLIS)

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
    let index = this.listeners.indexOf(listener)
    if (index > -1)
    {
      this.listeners.splice(index, 1 ); 
    }

    index = this.criticalListeners.indexOf(listener)
    if (index > -1)
    {
      this.criticalListeners.splice(index, 1 ); 
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

  public getPropertyForFilter(key:string)
  {
    switch (key)
    {
      case 'identityHashCode':
        return this.computeIdentityHashCode()

      default:
        return this.getProperty(key)
    }
  }

  public isPersisted():boolean
  {
    let isPersisted = true

    let identityRelevantAttributeNames = this.dataProvider.getConfig().getIdentityRelevantAttributeNames()
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

  public setProperties(map:ObjectMap)
  {
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

  getChangedProperties()
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

  mergeChanges(objectMap:ObjectMap)
  {
    objectMap = this.mapDataIn(objectMap)

    let anythingChanged = false

    let updatedAtFieldKey = this.dataProvider.getConfig().getUpdatedAtFieldName()
    let shouldMerge = !this.hasProperty(updatedAtFieldKey) || new Date(this.getProperty(updatedAtFieldKey)) < new Date(objectMap[updatedAtFieldKey].toString())
    
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

  computeIdentityHashCode():string
  {
    return DataModel.computeIdentityHashCode(this, this.dataProvider.getConfig())
  }

  public performAction = (action:string, actionVariables:ObjectMap, payload:ObjectMap) =>
  {
    this.dataProvider.getConfig().getActionUrlSet().getActionUrl(action, this, actionVariables)

    // this.dataProviderConfig.getBackendConnector()
    // TODO: Do perform code...
  }

  public static computeIdentityHashCode(dataModel:DataModel|ObjectMap, dataProviderConfig:DataProviderConfig):string
  {
    let identityHashCode = dataProviderConfig.getDataProviderName() + '_'

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
