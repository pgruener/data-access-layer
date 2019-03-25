import { FilterCollection } from "./FilterCollection";
import { DataModel } from "../DataModel";
import { FilterRule } from "./FilterRule";
import { FilterRuleIn } from "./FilterRuleIn";
import { FilterRuleMarker } from "./FilterRuleMarker";
import { DataCollection } from "../DataCollection";

export class FilterMarking<T extends DataModel>
{
  private filterRuleMarkers:FilterRuleMarker<FilterRule<Object>>[] = []

  constructor(collection:FilterCollection<T>|DataCollection<T>)
  {
    let filterCollection:FilterCollection<T> = (collection instanceof DataCollection) ? collection.filterCollection : collection

    if (filterCollection)
    {
      filterCollection.filterRules.forEach((filterRule) => {
        this.filterRuleMarkers.push(new FilterRuleMarker(filterRule))
      })
    }
  }

  public filterMarkersForField(fieldName:string, filterCallback?:(filterRule:FilterRule<Object>) => boolean):FilterRuleMarker<FilterRule<Object>>[]
  {
    return this.filterRuleMarkers.filter((filterRuleMarker) => {

      if (filterRuleMarker.filterRule.fieldName != fieldName)
      {
        return false
      }

      return (filterCallback) ? filterCallback(filterRuleMarker.filterRule) : true
    })
  }


  public findInFilter(fieldName:string):FilterRuleMarker<FilterRuleIn<Object>>[]
  {
    return this.filterMarkersForField(fieldName, this.inFilter) as FilterRuleMarker<FilterRuleIn<Object>>[]
  }

  public findEqualFilter(fieldName:string):FilterRuleMarker<FilterRule<Object>>[]
  {
    return this.filterMarkersForField(fieldName, this.equalFilter)
  }

  private inFilter(filterRule:FilterRule<Object>):boolean
  {
    return filterRule instanceof FilterRuleIn
  }

  private equalFilter(filterRule:FilterRule<Object>):boolean
  {
    return (filterRule.comparator == '==') 
  }

  public getUnusedFilters():FilterRule<Object>[]
  {
    return this.filterRuleMarkers.filter((filterRuleMarker) => {
      return !filterRuleMarker.used
    }).map(filterRuleMarker => filterRuleMarker.filterRule)
  }
}
