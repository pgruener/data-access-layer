import {DataCollection} from './DataCollection';
import { DataModel } from './DataModel';

interface DataCollectionChangeListener<T extends DataModel>
{
  dataCollectionChanged:(dataCollection:DataCollection<T>, forceTriggerChildren?:boolean) => void
}

export = DataCollectionChangeListener