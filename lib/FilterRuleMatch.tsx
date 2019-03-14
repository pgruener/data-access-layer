import { FilterRule } from "./FilterRule";

const MATCHER_FUNCTION = (value1:String, value2:string) => { return value2.toString().match(value1.toString()) != null }

export class FilterRuleMatch extends FilterRule<String>
{
  constructor(fieldName:string, pattern:string)
  {
    super(fieldName, MATCHER_FUNCTION, pattern)
  }

  asUrlString()
  {
    return `match(${this.fieldName}, ${this.value})`
  }
}
