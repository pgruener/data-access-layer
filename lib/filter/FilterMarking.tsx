import { FilterCollection } from "./FilterCollection";
import { DataModel } from "../DataModel";
import { FilterRule } from "./FilterRule";
import { FilterRuleIn } from "./FilterRuleIn";
import { FilterRuleMarker } from "./FilterRuleMarker";
import { DataCollection } from "../DataCollection";

/**
 * FilterMarkings are used to detect, which relevant properties are already used in the url or payload as data,
 * so all other filters *may* be appended to the url.
 * 
 * @class FilterMarking
 * @see DataProviderConfig
 */
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

  public filterMarkersForProperty(propertyName:string, filterCallback?:(filterRule:FilterRule<Object>) => boolean):FilterRuleMarker<FilterRule<Object>>[]
  {
    return this.filterRuleMarkers.filter((filterRuleMarker) => {

      if (filterRuleMarker.filterRule.propertyName != propertyName)
      {
        return false
      }

      return (filterCallback) ? filterCallback(filterRuleMarker.filterRule) : true
    })
  }


  public findInFilter(propertyName:string):FilterRuleMarker<FilterRuleIn<Object>>[]
  {
    return this.filterMarkersForProperty(propertyName, this.isFilterRuleIn) as FilterRuleMarker<FilterRuleIn<Object>>[]
  }

  /**
   * Detects, if given FilterRule is instance of FilterRuleIn
   * 
   * @method isFilterRuleIn
   * @param {FilterRule} filterRule 
   */
  private isFilterRuleIn(filterRule:FilterRule<Object>):boolean
  {
    return filterRule instanceof FilterRuleIn
  }

  public getUnusedFilters():FilterRule<Object>[]
  {
    return this.filterRuleMarkers.filter((filterRuleMarker) => {
      return !filterRuleMarker.used
    }).map(filterRuleMarker => filterRuleMarker.filterRule)
  }
}
