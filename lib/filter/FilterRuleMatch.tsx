import { FilterRule } from "./FilterRule";

const MATCHER_FUNCTION = (value:String, regexp:string) => {

  let REGEXP_MATCHER = /^\/(.*)\/([eimg]*)$/

  /**
   * @example
   *   /.A/ig  => [ "/.A/ig", ".A", "ig" ]
   */
  let foundRegExp = regexp.toString().match(REGEXP_MATCHER)

  let search

  if (foundRegExp == null)
  {
    search = regexp
  }
  else
  {
    let pattern = foundRegExp[1]
    let flags = foundRegExp[2]
    search = new RegExp(pattern, flags)
  }

  return value.toString().match(search) != null
}

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
