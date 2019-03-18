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
  protected value:T
  private compareFunction:CompareFunction<T>
  private comparator:FilterComparator|CompareFunction<T>

  constructor(fieldName:string, comparator:FilterComparator|CompareFunction<T>, value:T)
  {
    this.comparator = comparator
    this._fieldName = fieldName
    this.value = value

    if (typeof comparator == 'string')
    {
      this.compareFunction = this.compareFunctions[comparator]
    }
    else
    {
      this.compareFunction = comparator
    }
  }

  get fieldName()
  {
    return this._fieldName
  }

  private isInside(dataModel:DataModel):boolean
  {
    let value = dataModel.getPropertyForFilter(this.fieldName) as T

    return this.compareFunction(value, this.value)
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
    return `${this.fieldName}${this.comparator}${this.value}`
  }
}

