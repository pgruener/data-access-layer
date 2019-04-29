import { DataModelProperty } from "./DataModelProperty";
import { DataModelPropertyMetaDate } from "./DataModelPropertyMetaDate";
import { ClassUnmodifiableError } from './ClassUnmodifiableError'
export class UnmodifiableDataModelProperty extends DataModelProperty
{
  constructor(value:any, propertyMetaDates:{[s:string]: Date})
  {
    super(value)
    this.propertyMetaDates = propertyMetaDates
  }

  setMetaDate(dataModelPropertyMetaDate:DataModelPropertyMetaDate, date?:Date)
  {
    throw new ClassUnmodifiableError('Setting meta dates is not allowed in unmodifiable class.')
  }
}
