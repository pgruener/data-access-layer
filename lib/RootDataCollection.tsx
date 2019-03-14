import {DataCollection} from './DataCollection'
import { DataModel } from './DataModel';
import DataModelChangeListener = require("./DataModelListener");

class RootDataCollection<T extends DataModel> extends DataCollection<T> implements DataModelChangeListener
{
  public addDataModel(dataModel:T)
  {
    if (this.allEntities.indexOf(dataModel) === -1)
    {
      this.allEntities.push(dataModel)
      dataModel.addListener(this)

      this.storeEntitiesAndApplyFilters(this.allEntities)
    }
  }

  public setEntities(entities:T[])
  {
    this.allEntities.forEach((entity:T) => {
      entity.removeListener(this)
    })

    entities.forEach((entity:T) => {
      entity.addListener(this)
    })

    this.storeEntitiesAndApplyFilters(entities)
  }


  dataModelChanged(dataModel:T)
  {
    if (this.allEntities.indexOf(dataModel) !== -1)
    {
      this.triggerListeners(true)
    }
  }
}

export = RootDataCollection