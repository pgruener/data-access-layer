import { DataCollectionChangeProvider } from './DataCollectionChangeProvider'
import { FilterRule } from './filter/FilterRule'
import { DataProvider } from './DataProvider';
import { DataCollectionChangeListener } from './DataCollectionChangeListener';
import { DataModel } from './DataModel';
import { DataCollection } from './DataCollection';

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
