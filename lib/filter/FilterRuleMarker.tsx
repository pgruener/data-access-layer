import { FilterRule } from "./FilterRule";

/**
 * 
 * @class FilterRuleMarker
 * @see FilterMarking
 */
export class FilterRuleMarker<T extends FilterRule<Object>>
{
  private _filterRule:T
  private _used:boolean = false

  constructor(filterRule:T)
  {
    this._filterRule = filterRule
  }

  /**
   * Attribute accessor for filterRule
   */
  get filterRule():T
  {
    return this._filterRule
  }

  /**
   * Attribute accesor for used
   */
  get used():boolean
  {
    return this._used
  }

  /**
   * @method use
   * @return {T} filterRule
   */
  public use():T
  {
    this._used = true
    return this.filterRule
  }
}
