import { DataCollectionChangeProvider } from './internal'
import { FilterRule } from './filter/FilterRule'
import { DataProvider } from './internal';
import { DataCollectionChangeListener } from './internal';
import { DataModel } from './internal';
import { DataCollection } from './internal';

/**
 * @interface DataCollectionConfig
 */
export interface DataCollectionConfig<T extends DataModel>
{
  dataProvider:DataProvider<T>
  changeProvider:DataCollectionChangeProvider<T>
  initialEntities?:DataModel[]
  scope:string
  filter?:FilterRule<Object>|FilterRule<Object>[]
  changeListener?:DataCollectionChangeListener<T>
  topCollection:DataCollection<T>
  sorting?:string|{(t1:T, t2:T):number}
}
