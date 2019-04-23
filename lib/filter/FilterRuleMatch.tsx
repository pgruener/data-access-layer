import { FilterRule } from "./FilterRule";

const MATCHER_FUNCTION = (value1:String, value2:string) => { return value1.toString().match(value2.toString()) != null }

export class FilterRuleMatch extends FilterRule<String>
{
  constructor(propertyName:string, pattern:string)
  {
    super(propertyName, MATCHER_FUNCTION, pattern)
  }

  asUrlString()
  {
    return encodeURIComponent(`match(${this.propertyName}, ${this.value})`)
  }
}
