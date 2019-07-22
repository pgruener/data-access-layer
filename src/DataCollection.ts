import { DataCollectionChangeListener } from './internal'
import { DataCollectionChangeProvider } from './internal'
import { DataCollectionConfig } from './internal'
import { FilterRule } from './filter/FilterRule'
import { FilterCollection } from './filter/FilterCollection';
import { DataProvider } from './internal';
import { DataModel } from './internal';
import { ApplyFilterMode } from './internal';

/**
 * @class DataCollection
 * A DataCollection holds and manages a collection of DataModel instances.
 */
export class DataCollection<T extends DataModel> implements DataCollectionChangeListener<T>, DataCollectionChangeProvider<T> 
{
  private static INSTANCE_COUNTER = 0

  // All entities retreived from the parent collection or data provider
  protected allEntities:T[] = new Array()

  // Remaining entities, after applying filters
  protected filteredEntities:T[] = new Array()

  // Collection that holds all filters that are applied to this DataCollection
  private _filters:FilterCollection<T>
  
  private changeProvider:DataCollectionChangeProvider<T>
  protected dataProvider:DataProvider<T>
  private scopeName:string
  private _topCollection:DataCollection<T>

  private changeListeners:Array<DataCollectionChangeListener<T>> = new Array()

  // Only used to help debugging (i.e.: if (this.instanceNr == 10) { debugger } ) 
  private _instanceNr:number

  private _sorting:string|{(t1:T, t2:T) : number}

  constructor(config:DataCollectionConfig<T>)
  {
    this._instanceNr = ++DataCollection.INSTANCE_COUNTER

    this.scopeName = config.scope
    this.dataProvider = config.dataProvider
    this.changeProvider = config.changeProvider
    this._sorting = config.sorting
    config.changeProvider.addChangeListener(this)

    if (config.changeListener)
    {
      this.addChangeListener(config.changeListener)
    }

    this._topCollection = (config.topCollection == null) ? this : config.topCollection


    this._filters = new FilterCollection(this, config.filter)

    this.storeEntitiesAndApplyFilters(config.initialEntities)
  }

  setSorting(_sorting:string|{(t1:T, t2:T) : number}, once?:boolean)
  {
    if (_sorting != this._sorting)
    {
      this.filteredEntities = this.sort(this.filteredEntities, _sorting)

      if (once)
      {
        this._sorting = undefined
      }
      else
      {
        this._sorting = _sorting
      }
    }
  }

  private sort(entities:T[], sorting:string|{ (t1:T, t2:T):number }):T[]
  {
    if (typeof sorting == 'string')
    {
      return entities.sort((t1:T, t2:T) => {
        let x = t1.getPropertyForFilter(sorting.toString())
        let y = t2.getPropertyForFilter(sorting.toString())

        return  x - y
      })
    }
    else if (sorting instanceof Function)
    {
      return entities.sort(sorting)
    }
    else
    {
      return entities.slice(0)
    }
  }

  /**
   * Attribute accessor for the collections topCollection
   */
  get topCollection():DataCollection<T>
  {
    return this._topCollection
  }

  /**
   * Attribute accessor for the collections filterCollection
   */
  get filterCollection():FilterCollection<T>
  {
    return this._filters
  }

  /**
   * Stores the entities retreived and applies filters to it.
   * 
   * @method storeEntitiesAndApplyFilters
   * @param {DataModel[]} entities collection retreived from data provider
   * @param {boolean} [forceTriggerChildren] 
   */
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
    let mapAsMap = searchMap as {[s:string]: Object}

    this.filteredEntities.some((currentEntity:T) => {

      let shouldUseEntity = true

      if (typeof searchMap == 'string')
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

  protected applyFilters(applyFilterMode:ApplyFilterMode):boolean
  {
    let filteredEntities:T[] = this._filters.run(this.allEntities)

    let somethingChanged =  applyFilterMode == 'force' || this.filteredEntitiesChanged(filteredEntities)

    this.filteredEntities = this.sort(filteredEntities, this._sorting)

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

  /**
   * Attribute accessor for instanceNr
   */
  get instanceNr()
  {
    return this._instanceNr
  }

  /**
   * Retreives entities - sorted, if desired
   * @param {string|{ (t1:T, t2:T):number}} [sorting] property to sort or sorting method
   * @return {T[]} entities
   */
  public getEntities(sorting?:string|{ (t1:T, t2:T):number }):T[]
  {
    if (sorting != undefined)
    {
      return this.sort(this.filteredEntities, sorting)
    }
    else
    {
      return this.filteredEntities.slice(0)
    }
  }

  /**
   * Informs, if the collection is empty.
   * @method isEmpty
   * @return {boolean} <code>true</code> if no entity available, <code>false</code> otherwise.
   */
  isEmpty():boolean
  {
    return this.filteredEntities.length === 0
  }

  /**
   * Returns the first entity in the collection
   * @method getFirstEntity
   * @return {T} entity or null
   */
  getFirstEntity():T
  {
    if (this.isEmpty())
    {
      return null
    }

    return this.filteredEntities[0]
  }

  /**
   * Returns the last entity in the collection
   * @method getLastEntity
   * @return {T} entity or null
   */
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
    this.dataProvider.filtersChanged(this.scopeName, this)

    return this.applyFilters('normal')
  }


  /**
   * Creates an exact same copy to this DataCollection
   * @method createCopy
   * @return {DataCollection<T>}
   */
  public createCopy():DataCollection<T>
  {
    return new DataCollection({ dataProvider: this.dataProvider, changeProvider: this.changeProvider, initialEntities: this.allEntities, filter: this.filterCollection.filterRules, scope: this.scopeName, topCollection: this.topCollection})
  }

  /**
   * Creates a sub collection with filters given
   * @method createSubCollection
   * @param {FilterRule<Object>|FilterRule<Object>[]} filter
   * @return {DataCollection<T>}
   */
  public createSubCollection(filter:FilterRule<Object>|FilterRule<Object>[]):DataCollection<T>
  {
    return new DataCollection({ dataProvider: this.dataProvider, changeProvider: this, initialEntities: this.filteredEntities, filter: filter, scope: this.scopeName, topCollection: this.topCollection})
  }

  protected triggerListeners(forceTriggerChildren?:boolean)
  {
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
