import RX = require('reactxp');
import DataModel = require('../../DataModel');
import DataComponentUpdater = require('../../DataComponentUpdater');
import DataCollection = require('../../DataCollection');

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
