import { DataModel } from '../DataModel';
import { FilterRule } from './FilterRule';
import { ValueRange } from '../ValueRange';

export class FilterRuleIn<T> extends FilterRule<T>
{
  private _valueRange:ValueRange<T>
  constructor(fieldName:string, valueRange:ValueRange<T>)
  {
    super(fieldName, null, null)

    if (valueRange.startValue > valueRange.endValue)
    {
      throw new Error(`Invalid ValueRange. startValue (${valueRange.startValue}) may not be larger than endValue (${valueRange.endValue}).`)
    }

    this._valueRange = valueRange
  }

  get valueRange()
  {
    return this._valueRange
  }

  public filter = (dataModels:DataModel[]):DataModel[] =>
  {
    return dataModels.filter((dataModel) => {

      let property = dataModel.getPropertyForFilter(this.fieldName)

      return property >= this._valueRange.startValue && property <= this._valueRange.endValue
    })
  }

  asUrlString()
  {
    return encodeURIComponent(`in(${this._fieldName}, ${this._valueRange.startValue}, ${this._valueRange.endValue})`)
  }
}
