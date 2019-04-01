import RX = require('reactxp');
import { DataComponentUpdater } from '../../lib/DataComponentUpdater';
import { DataCollection } from '../../lib/DataCollection';
import { DataModel } from '../../lib/DataModel';

class RXComponentUpdater extends DataComponentUpdater
{
  private component:RX.Component

  constructor(component:RX.Component, collections?:DataCollection<DataModel>[]|DataCollection<DataModel>)
  {
    super(collections)
    this.component = component
  }

  dataModelChanged(dataModel:DataModel)
  {
    this.component.forceUpdate()
  }

  dataCollectionChanged(dataCollection:DataCollection<DataModel>, forceTriggerChildren?:boolean)
  {
    this.component.forceUpdate()
  }
}

export = RXComponentUpdater
