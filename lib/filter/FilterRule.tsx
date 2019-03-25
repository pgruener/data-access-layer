import { DataModel } from '../DataModel';

type FilterComparator = '<'|'<='|'>'|'>='|'=='|'!='
type CompareFunction<T> = (value1:T, value2:T) => boolean

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

  protected _fieldName:string
  protected _value:T
  private compareFunction:CompareFunction<T>
  private _comparator:FilterComparator|CompareFunction<T>

  constructor(fieldName:string, comparator:FilterComparator|CompareFunction<T>, value:T)
  {
    this._comparator = comparator
    this._fieldName = fieldName
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

  get comparator()
  {
    return this._comparator
  }

  get value()
  {
    return this._value
  }

  get fieldName()
  {
    return this._fieldName
  }

  private isInside(dataModel:DataModel):boolean
  {
    let value = dataModel.getPropertyForFilter(this.fieldName) as T

    return this.compareFunction(value, this._value)
  }

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

  asUrlString()
  {
    return `${this.fieldName}${encodeURIComponent(this.comparator.toString())}${encodeURIComponent(this._value.toString())}`
  }
}

