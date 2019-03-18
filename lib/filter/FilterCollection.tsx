import { FilterRule } from "./FilterRule";
import { DataModel } from '../DataModel';

export class FilterCollection<T extends DataModel>
{
  private _filterRules:FilterRule<Object>[] = new Array()

  public add<T>(filter:FilterRule<T>|FilterRule<T>[])
  {
    this._filterRules = this._filterRules.concat(filter)
  }

  public set<T>(filter:FilterRule<T>|FilterRule<T>[])
  {
    this.clear()
    this.add(filter)
  }

  private clear()
  {
    this._filterRules.length = 0
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
