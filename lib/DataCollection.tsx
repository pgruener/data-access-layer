import { DataCollectionChangeListener } from './DataCollectionChangeListener'
import { DataCollectionChangeProvider } from './DataCollectionChangeProvider'
import { DataCollectionConfig } from './DataCollectionConfig'
import { FilterRule } from './filter/FilterRule'
import { FilterCollection } from './filter/FilterCollection';
import { DataProvider } from './DataProvider';
import { DataModel } from './DataModel';
import { ApplyFilterMode } from './ApplyFilterMode';
import { FilterCollectionChangeListener } from './filter/FilterCollectionChangeListener';

export class DataCollection<T extends DataModel> implements DataCollectionChangeListener<T>, DataCollectionChangeProvider<T>, FilterCollectionChangeListener 
{
  private static INSTANCE_COUNTER = 0

  protected allEntities:T[] = new Array()
  protected filteredEntities:T[] = new Array()
  private _filters:FilterCollection<T>
  
  private changeProvider:DataCollectionChangeProvider<T>
  protected dataProvider:DataProvider<T>
  private scopeName:string

  private changeListeners:Array<DataCollectionChangeListener<T>> = new Array()

  private instanceNr:number

  constructor(config:DataCollectionConfig<T>)
  {
    this.instanceNr = ++DataCollection.INSTANCE_COUNTER

    this.scopeName = config.scope
    this.dataProvider = config.dataProvider
    this.changeProvider = config.changeProvider
    config.changeProvider.addChangeListener(this)

    if (config.changeListener)
    {
      this.addChangeListener(config.changeListener)
    }

    this._filters = new FilterCollection(this, config.filter)

    this.storeEntitiesAndApplyFilters(config.initialEntities)
  }

  get filterCollection():FilterCollection<T>
  {
    return this._filters
  }

  protected storeEntitiesAndApplyFilters(entities:DataModel[], forceTriggerChildren?:boolean)
  {
    this.allEntities = entities || new Array()

    this.applyFilters(forceTriggerChildren ? 'force' : 'normal')
  }

  dataCollectionChanged(dataCollection:DataCollection<T>, forceTriggerChildren?:boolean)
  {
    this.storeEntitiesAndApplyFilters(dataCollection.filteredEntities, forceTriggerChildren)
  }
  
  public find(searchMap:{[s:string]: Object}|string):T
  {
    let entity:T = null
    let shouldCompareByIdentityHashCode = typeof searchMap == 'string'
    let mapAsMap = searchMap as {[s:string]: Object}

    this.filteredEntities.some((currentEntity:T) => {

      let shouldUseEntity = true

      if (shouldCompareByIdentityHashCode)
      {
        shouldUseEntity = currentEntity.computeIdentityHashCode() == searchMap
      }
      else
      {
        Object.keys(searchMap).some((key) => {
          shouldUseEntity = shouldUseEntity && (currentEntity.getPropertyForFilter(key) == mapAsMap[key])
  
          return !shouldUseEntity
        })
      }


      if (shouldUseEntity)
      {
        entity = currentEntity
        return true
      }

      return false
    })

    return entity
  }

  get filters()
  {
    return this._filters
  }

  protected applyFilters(applyFilterMode:ApplyFilterMode):boolean
  {
    let filteredEntities:T[] = this._filters.run(this.allEntities)

    let somethingChanged =  applyFilterMode == 'force' || this.filteredEntitiesChanged(filteredEntities)

    this.filteredEntities = filteredEntities

    if (somethingChanged && applyFilterMode != 'skip')
    {
      this.triggerListeners()
    }

    return somethingChanged
  }

  private filteredEntitiesChanged(newFilteredEntities:DataModel[]):boolean
  {
    if (this.filteredEntities.length != newFilteredEntities.length)
    {
      return true
    }
    
    let lookupMap:{[s:string]: boolean} = {}

    this.filteredEntities.forEach((dataModel:DataModel) => {
      lookupMap[dataModel.computeIdentityHashCode()] = false
    })

    let entitiesChanged = false

    newFilteredEntities.some((dataModel:DataModel) => {
      
      let identiyHashCode = dataModel.computeIdentityHashCode()

      if (lookupMap.hasOwnProperty(identiyHashCode))
      {
        delete lookupMap[identiyHashCode]
        return false
      }
      else
      {
        entitiesChanged = true
        return true
      }
    })

    return entitiesChanged
  }

  public getInstanceNr()
  {
    return this.instanceNr
  }

  public getEntities():T[]
  {
    return this.filteredEntities.slice(0)
  }

  isEmpty():boolean
  {
    return this.filteredEntities.length === 0
  }

  getFirstEntity():T
  {
    if (this.isEmpty())
    {
      return null
    }

    return this.filteredEntities[0]
  }

  getLastEntity():T
  {
    if (this.isEmpty())
    {
      return null
    }

    return this.filteredEntities[this.filteredEntities.length - 1]
  }

  public filtersChanged = ():boolean =>
  {
    // TODO: Instead inform parent
    this.dataProvider.filtersChanged(this.scopeName, this)

    return this.applyFilters('normal')
  }

  public createCopy():DataCollection<T>
  {
    return new DataCollection({ dataProvider: this.dataProvider, changeProvider: this.changeProvider, initialEntities: this.allEntities, filter: this.filters.filterRules, scope: this.scopeName})
  }

  public createSubCollection(filter:FilterRule<Object>|FilterRule<Object>[]):DataCollection<T>
  {
    return new DataCollection({ dataProvider: this.dataProvider, changeProvider: this, initialEntities: this.filteredEntities, filter: filter, scope: this.scopeName})
  }

  public getFilteredDataModels()
  {
    return this.filteredEntities
  }

  protected triggerListeners(forceTriggerChildren?:boolean)
  {
    // console.log('DataCollection - trigger listeners', this.instanceNr, forceTriggerChildren)

    this.changeListeners.forEach((listener) => {
      listener.dataCollectionChanged(this, forceTriggerChildren)
    })
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
}
