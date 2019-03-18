import { DataCollectionChangeListener } from './DataCollectionChangeListener'
import { DataModel } from './DataModel';

export interface DataCollectionChangeProvider<T extends DataModel>
{
  addChangeListener(listener:DataCollectionChangeListener<T>):void
  removeChangeListener(listener:DataCollectionChangeListener<T>):void
}
