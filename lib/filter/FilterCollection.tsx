import { FilterRule } from "./FilterRule";
import { DataModel } from '../DataModel';
import { DataCollection } from "../DataCollection";

export class FilterCollection<T extends DataModel>
{
  private _filterRules:FilterRule<Object>[] = new Array()
  private ownerCollection:DataCollection<T>

  constructor(ownerCollection:DataCollection<T>, filter?:FilterRule<Object>|FilterRule<Object>[])
  {
    this.ownerCollection = ownerCollection
    this.add(filter, true)
  }

  private triggerListener(shouldSkipChangeListener?:boolean):boolean
  {
    if (!shouldSkipChangeListener)
    {
      return this.ownerCollection.filtersChanged()
    }

    return false
  }

  public add<T>(filter:FilterRule<T>|FilterRule<T>[], shouldSkipChangeListener?:boolean):boolean
  {
    if (filter === undefined)
    {
      return false
    }

    this._filterRules = this._filterRules.concat(filter)
    return this.triggerListener(shouldSkipChangeListener)
  }

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

  private removeIntern<T>(filterRule:FilterRule<T>)
  {
    let index = this._filterRules.indexOf(filterRule)
    if (index !== -1)
    {
      this._filterRules.splice(index, 1)
    }
  }

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

    return filteredEntities.slice(0)
  }

  get filterRules():FilterRule<Object>[]
  {
    return this._filterRules
  }
}
