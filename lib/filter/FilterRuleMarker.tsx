import { FilterRule } from "./FilterRule";

export class FilterRuleMarker<T extends FilterRule<Object>>
{
  private _filterRule:T
  private _used:boolean = false

  constructor(filterRule:T)
  {
    this._filterRule = filterRule
  }

  get filterRule():T
  {
    return this._filterRule
  }

  get used():boolean
  {
    return this._used
  }

  public use():T
  {
    this._used = true
    return this.filterRule
  }
}
