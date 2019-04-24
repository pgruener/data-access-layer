import { FilterRule } from "./FilterRule";
import { DataModel } from '../DataModel';
import { DataCollection } from "../DataCollection";
/**
 * A FilterCollection is connected to an instance of a {@link DataCollection}. It holds all {@link FilterRule|FilterRules}
 * instances, that are used to filter the DataCollection.
 * 
 * By default it just removes objects from the DataCollection, that are marked for deletion.
 * 
 * @class FilterCollection
 */
export class FilterCollection<T extends DataModel>
{
  private _filterRules:FilterRule<Object>[] = new Array()
  private ownerCollection:DataCollection<T>

  constructor(ownerCollection:DataCollection<T>, filter?:FilterRule<Object>|FilterRule<Object>[])
  {
    this.ownerCollection = ownerCollection
    this.add(filter, true)
  }

  /**
   * Triggers filtersChanged on listener, if optional skip parameter is not set to true.
   * 
   * @private
   * @method triggerListener
   * @param {boolean} [shouldSkipChangeListener] 
   * @returns {boolean} <code>true</code>, if something changed, <code>false</code> otherwise.
   */
  private triggerListener(shouldSkipChangeListener?:boolean):boolean
  {
    if (!shouldSkipChangeListener)
    {
      return this.ownerCollection.filtersChanged()
    }

    return false
  }

  /**
   * Adds a {@link FilterRule} or an array of FilterRule to the {@link FilterCollection}. 
   * This automatically triggers the {@link DataCollection|DataCollections} recalculation of
   * elements, if shouldSkipChangeListener is false (default behavior)
   * 
   * @method add
   * @param {FilterRule<T>|FilterRule<T>[]} filter to be added
   * @param {boolean} [shouldSkipChangeListener] 
   */
  public add<T>(filter:FilterRule<T>|FilterRule<T>[], shouldSkipChangeListener?:boolean):boolean
  {
    if (filter === undefined)
    {
      return false
    }

    this._filterRules = this._filterRules.concat(filter)
    return this.triggerListener(shouldSkipChangeListener)
  }

  /**
   * Removes a {@link FilterRule} or an array of FilterRules from the FilterCollection.
   * Returns <code>true</code>, if the removal changed the filteredEntities of connected collections.
   * 
   * @method remove
   * @param {FilterRule<T>|FilterRule<T>[]} filter to remove
   * @returns {boolean} somethingChanged
   */
  public remove<T>(filter:FilterRule<T>|FilterRule<T>[]):boolean
  {
    if (filter instanceof Array)
    {
      filter.forEach((currentFilter) => {
        this.removeIntern(currentFilter)
      })
    }
    else
    {
      this.removeIntern(filter)
    }
    
    return this.triggerListener()
  }

  /**
   * Removes the given FilterRule from the FilterCollection.
   * 
   * @private
   * @method removeIntern
   * @param {FilterRule} filterRule 
   */
  private removeIntern<T>(filterRule:FilterRule<T>)
  {
    let index = this._filterRules.indexOf(filterRule)
    if (index !== -1)
    {
      this._filterRules.splice(index, 1)
    }
  }

  /**
   * Clears collection and sets the given {@link FilterRule} or array of FilterRules as new filters.
   * 
   * @method set
   * @param {FilterRule} filter 
   * @returns {boolean} somethingChanged
   */
  public set<T>(filter:FilterRule<T>|FilterRule<T>[]):boolean
  {
    this.clear(true)
    return this.add(filter)
  }

  public clear(shouldSkipChangeListener?:boolean):boolean
  {
    this._filterRules.length = 0
    return this.triggerListener(shouldSkipChangeListener)
  }

  /**
   * Applies all filterRules to the entities and returns filtered list of entities.
   * @method run
   * @param {T[]} allEntities 
   * @returns {T[]} filteredEntities
   */
  public run(allEntities:T[]):T[]
  {
    let filteredEntities:T[] = allEntities.slice(0)

    // Attention
    // The idea of tweaking the performance by reordering the filterRules
    // may not give correct results, since some FilterRules depend on the order (i.e. FilterRuleMax).
    // Before implementing, we would have to prove, that our result is deterministically the same.

    this._filterRules.forEach((filterRule:FilterRule<T>) => {
      filteredEntities = filterRule.filter(filteredEntities) as T[]
    })

    return this.removeEntitiesMarkedForDeletion(filteredEntities)
  }

  /**
   * Filters entities to not contain ones that are marked for deletion.
   * 
   * @private
   * @method removeEntitiesMarkedForDeletion
   * @param {T[]} entities 
   * @returns {T[]}
   */
  private removeEntitiesMarkedForDeletion(entities:T[]):T[]
  {
    return entities.filter((entity:T) => {
      return !entity.isMarkedForDeletion()
    })
  }

  /**
   * Attribute accessor for filterRules
   */
  get filterRules():FilterRule<Object>[]
  {
    return this._filterRules
  }
}
