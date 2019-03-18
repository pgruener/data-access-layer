import { DataCollection } from './DataCollection';
import { DataModel } from './DataModel';

export interface DataCollectionChangeListener<T extends DataModel>
{
  dataCollectionChanged:(dataCollection:DataCollection<T>, forceTriggerChildren?:boolean) => void
}
