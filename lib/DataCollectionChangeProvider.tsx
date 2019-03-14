import DataCollectionChangeListener = require('./DataCollectionChangeListener')
import { DataModel } from './DataModel';

interface DataCollectionChangeProvider<T extends DataModel>
{
  addChangeListener(listener:DataCollectionChangeListener<T>):void
  removeChangeListener(listener:DataCollectionChangeListener<T>):void
}

export = DataCollectionChangeProvider