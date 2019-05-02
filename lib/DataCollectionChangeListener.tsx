import { DataCollection } from './internal';
import { DataModel } from './internal';

/**
 * @interface DataCollectionChangeListener
 * @see DataCollectionChangeProvider
 */
export interface DataCollectionChangeListener<T extends DataModel>
{
  dataCollectionChanged:(dataCollection:DataCollection<T>, forceTriggerChildren?:boolean) => void
}
