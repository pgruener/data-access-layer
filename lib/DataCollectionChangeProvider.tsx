import { DataCollectionChangeListener } from './internal'
import { DataModel } from './internal';

/**
 * @interface DataCollectionChangeProvider
 * @see DataCollectionChangeListener
 */
export interface DataCollectionChangeProvider<T extends DataModel>
{
  addChangeListener(listener:DataCollectionChangeListener<T>):void
  removeChangeListener(listener:DataCollectionChangeListener<T>):void
}
