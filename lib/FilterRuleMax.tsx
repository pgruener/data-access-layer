import { DataModel } from './DataModel';
import { FilterRule } from './FilterRule';

export class FilterRuleMax extends FilterRule<String>
{
  constructor(fieldName:string)
  {
    super(fieldName, null, null)
  }

  public filter = (dataModels:DataModel[]):DataModel[] =>
  {
    if (dataModels.length == 0)
    {
      return dataModels
    }

    dataModels.sort((model1, model2) => {
      return parseInt(model2.getPropertyForFilter(this.fieldName).toString(), 10) - parseInt(model1.getPropertyForFilter(this.fieldName).toString(), 10)
    })

    return [dataModels[0]]
  }

  asUrlString()
  {
    return `max(${this.fieldName})`
  }
}
