import { DataModel } from '../DataModel';

type FilterComparator = '<'|'<='|'>'|'>='|'=='|'!='
type CompareFunction<T> = (value1:T, value2:T) => boolean
/**
 * A FilterRule specifies one conrete rule, how to filter data from a {@link DataCollection}.
 * The FilterRules base class offers trivial filtering with value comparison. There are more
 * complicated FilterRules, that inherit from FilterRule. You also can create your own subclass
 * of FilterRule, if neccessary.
 * 
 * @class FilterRule
 * @see FilterRuleIn
 * @see FilterRuleMatch
 * @example
 *   new FilterRule('amount', '<', 10)
 */
export class FilterRule<T>
{
  private compareFunctions:{[s:string] : CompareFunction<T>} = {
    '<': (value1:T, value2:T) => { return value1 < value2 },
    '<=': (value1:T, value2:T) => { return value1 <= value2 },
    '>': (value1:T, value2:T) => { return value1 > value2 },
    '>=': (value1:T, value2:T) => { return value1 >= value2 },
    '==': (value1:T, value2:T) => { return value1 == value2 },
    '!=': (value1:T, value2:T) => { return value1 != value2 },
  }

  protected _propertyName:string
  protected _value:T
  private compareFunction:CompareFunction<T>
  private _comparator:FilterComparator|CompareFunction<T>

  constructor(propertyName:string, comparator:FilterComparator|CompareFunction<T>, value:T)
  {
    this._comparator = comparator
    this._propertyName = propertyName
    this._value = value

    if (typeof comparator == 'string')
    {
      this.compareFunction = this.compareFunctions[comparator]
    }
    else
    {
      this.compareFunction = comparator
    }
  }

  /**
   * Attribute accessor for comparator
   */
  get comparator()
  {
    return this._comparator
  }

  /**
   * Attribute accessor for value
   */
  get value()
  {
    return this._value
  }

  /**
   * Attribute accessor for propertyName
   */
  get propertyName()
  {
    return this._propertyName
  }

  /**
   * Informs, if the dataModel is accepted by the filterRule.
   * 
   * @method isInside
   * @param {DataModel} dataModel 
   * @returns {boolean}
   */
  private isInside(dataModel:DataModel):boolean
  {
    let value = dataModel.getPropertyForFilter(this.propertyName) as T

    return this.compareFunction(value, this.value)
  }


  /**
   * Maybe can be optimized by doing this:
   * 
   * dataModels.filter((dataModel:DataModel) => {
   *   return this.isInside(dataModel)
   * })
   */

  public filter = (dataModels:DataModel[]):DataModel[] =>
  {
    let filteredModels:DataModel[] = []

    dataModels.forEach((dataModel:DataModel) => {
      if (this.isInside(dataModel))
      {
        filteredModels.push(dataModel)
      }
    })

    return filteredModels
  }

  /**
   * Returns the filterRule as url string to be transmitted to a backend.
   * 
   * @method asUrlString
   * @returns {string}
   */
  asUrlString()
  {
    return `${this.propertyName}${encodeURIComponent(this.comparator.toString())}${encodeURIComponent(this.value.toString())}`
  }
}

