import { DataModelPropertyMetaDate } from './DataModelPropertyMetaDate'

export class DataModelProperty
{
  private _value:any
  protected propertyMetaDates:{[s:string]: Date}

  constructor(value:any)
  {
    this._value = value
    this.setMetaDateIntern('created')
    this.setMetaDateIntern('last_change')
    this.setMetaDateIntern('last_export', new Date(0))
  }

  public setValue(newValue:any)
  {
    this._value = newValue
    this.setMetaDateIntern('last_change')
  }

  get metaDates()
  {
    return this.propertyMetaDates
  }

  setMetaDate(dataModelPropertyMetaDate:DataModelPropertyMetaDate, date?:Date)
  {
    this.setMetaDateIntern(dataModelPropertyMetaDate, date)
  }

  private setMetaDateIntern(dataModelPropertyMetaDate:DataModelPropertyMetaDate, date?:Date)
  {
    this.propertyMetaDates[dataModelPropertyMetaDate] =  date || new Date()
  }

  getMetaDate(dataModelPropertyMetaDate:DataModelPropertyMetaDate)
  {
    return this.propertyMetaDates[dataModelPropertyMetaDate] || null
  }

  exportValue()
  {
    this.setMetaDateIntern('last_export')
    return this.value
  }

  public shouldExport()
  {
    return this.getMetaDate('last_change') > this.getMetaDate('last_export')
  }

  get value()
  {
    this.setMetaDateIntern('returned_value')
    return this._value
  }
}
