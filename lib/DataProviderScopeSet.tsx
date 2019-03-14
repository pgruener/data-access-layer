import DataProviderScope = require("./DataProviderScope");

interface DataProviderScopeSet
{
  index?: DataProviderScope
  [s:string]: DataProviderScope
}

export = DataProviderScopeSet