import DataCollectionChangeProvider = require('./DataCollectionChangeProvider')
import {FilterRule} from './FilterRule'
import { DataProvider } from './DataProvider';
import DataCollectionChangeListener = require('./DataCollectionChangeListener');
import { DataModel } from './DataModel';

interface DataCollectionConfig<T extends DataModel>
{
  dataProvider:DataProvider<T>
  changeProvider:DataCollectionChangeProvider<T>
  initialEntities?:DataModel[]
  scope:string
  filter?:FilterRule<Object>|FilterRule<Object>[]
  changeListener?:DataCollectionChangeListener<T>
}

export = DataCollectionConfig