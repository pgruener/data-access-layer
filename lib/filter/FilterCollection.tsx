import {FilterRule} from "./FilterRule";
import { DataModel } from '../DataModel';

export class FilterCollection<T extends DataModel>
{
  private filterRules:FilterRule<Object>[] = new Array()

  public addFilter<T>(filter:FilterRule<T>|FilterRule<T>[])
  {
    this.filterRules = this.filterRules.concat(filter)
  }

  public setFilter<T>(filter:FilterRule<T>|FilterRule<T>[])
  {
    this.clearList()
    this.addFilter(filter)
  }

  private clearList()
  {
    this.filterRules.length = 0
  }

  public runFilters(allEntities:T[]):T[]
  {
    let filteredEntities:T[] = allEntities.slice(0)

    // Attention
    // The idea of tweaking the performance by reordering the filterRules
    // may not give correct results, since some FilterRules depend on the order (i.e. FilterRuleMax).
    // Before implementing, we would have to prove, that our result is deterministically the same.

    this.filterRules.forEach((filterRule:FilterRule<T>) => {
      filteredEntities = filterRule.filter(filteredEntities) as T[]
    })

    return filteredEntities.slice(0)
  }

  public getFilterRules():FilterRule<Object>[]
  {
    return this.filterRules
  }
}
