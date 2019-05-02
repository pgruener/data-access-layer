import { DataModelPropertySet, ObjectMap, UnmodifiableDataModelProperty, ClassUnmodifiableError } from "./internal";

export class UnmodifiableDataModelPropertySet extends DataModelPropertySet
{
  constructor(dataModelPropertySet:DataModelPropertySet)
  {
    super()

    dataModelPropertySet.getAllPropertieNames().forEach((propertyName) => {
      this.properties[propertyName] = new UnmodifiableDataModelProperty(dataModelPropertySet.getValue(propertyName), dataModelPropertySet.getMetaDates(propertyName))
    })
  }

  public clear()
  {
    throw new ClassUnmodifiableError('Cannot clear unmodifiable class.')
  }

  public removeProperty(propertyName:string)
  {
    throw new ClassUnmodifiableError('Cannot remove property in unmodifiable class.')
  }

  public set(propertyName:string, value:any)
  {
    throw new ClassUnmodifiableError('Cannot set value in unmodifiable class.')
  }

  public exportAsObjectMap():ObjectMap
  {
    return null
  }
}
