import { DataModel } from '../DataModel';
import { FilterRule } from './FilterRule';
import { ValueRange } from '../ValueRange';

/**
 * FilterRuleIn is a subclass of {@link FilterRule}. It allows to filter a property with a {@link ValueRange}.
 * Using FilterRuleIn is favored over combining two FilterRules with > and < filter for the same property,
 * because FilterRuleIn's properties can be used in action urls.
 * 
 * @class FilterRuleIn
 * @see FilterRule
 * @example
 *   new FilterRuleIn('amount', '<', { startValue: 10, endValue: 20 })
 */
export class FilterRuleIn<T> extends FilterRule<T>
{
  private _valueRange:ValueRange<T>
  constructor(propertyName:string, valueRange:ValueRange<T>)
  {
    super(propertyName, null, null)

    if (valueRange.startValue > valueRange.endValue)
    {
      throw new Error(`Invalid ValueRange. startValue (${valueRange.startValue}) may not be larger than endValue (${valueRange.endValue}).`)
    }

    this._valueRange = valueRange
  }

  /**
   * Attribute accessor for valueRange
   */
  get valueRange()
  {
    return this._valueRange
  }

  public filter = (dataModels:DataModel[]):DataModel[] =>
  {
    return dataModels.filter((dataModel) => {

      let property = dataModel.getPropertyForFilter(this.propertyName)

      return property >= this._valueRange.startValue && property <= this._valueRange.endValue
    })
  }

  asUrlString()
  {
    return encodeURIComponent(`in(${this._propertyName}, ${this._valueRange.startValue}, ${this._valueRange.endValue})`)
  }
}
