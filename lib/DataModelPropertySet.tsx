import { DataModelProperty, ObjectMap, UnmodifiableDataModelPropertySet } from "./internal";

export class DataModelPropertySet
{
  protected properties:{[s:string]: DataModelProperty} = {}

  constructor(objectMap?:ObjectMap)
  {
    if (objectMap)
    {
      Object.keys(objectMap).forEach((propertyName:string) => {
        this.set(propertyName, objectMap[propertyName])
      })
    }
  }

  public getAllPropertieNames()
  {
    return Object.keys(this.properties)
  }

  public hasProperty(propertyName:string, value?:any)
  {
    let hasProperty = this.properties.hasOwnProperty(propertyName)
    if (hasProperty && value)
    {
      return this.getValue(propertyName) === value
    }
    else
    {
      return hasProperty
    }
  }

  public getValue<T>(propertyName:string)
  {
    if (this.properties[propertyName] && this.properties[propertyName].value)
    {
      return this.properties[propertyName].value as T
    }
    else
    {
      return undefined
    }
    // return this.properties[propertyName].value as T
  }
  
  public getMetaDates(propertyName:string)
  {
    return this.properties[propertyName].metaDates
  }

  public clear()
  {
    this.properties = {}
  }

  public removeProperty(propertyName:string)
  {
    delete this.properties[propertyName]
  }

  public set(propertyName:string, value:any)
  {
    if (this.hasProperty(propertyName))
    {
      this.properties[propertyName].setValue(value)
    }
    else
    {
      this.properties[propertyName] = new DataModelProperty(value)
    }
  }

  public exportAsObjectMap():ObjectMap
  {
    let map:ObjectMap = {}

    Object.keys(this.properties).forEach((propertyName) => {
      let property = this.properties[propertyName]

      if (property.shouldExport())
      {
        map[propertyName] = property.exportValue()
      }
    })

    return map
  }

  public hasChangesSinceLastExport():boolean
  {
    return Object.keys(this.properties).filter((propertyName) => {
      return this.properties[propertyName].shouldExport()
    }).length != 0
  }

  public asObjectMap():ObjectMap
  {
    let map:ObjectMap = {}

    Object.keys(this.properties).forEach((propertyName) => {
      map[propertyName] = this.properties[propertyName].value
    })

    return map
  }

  public unmodifiableClone():UnmodifiableDataModelPropertySet
  {
    return new UnmodifiableDataModelPropertySet(this)
  }
}
