import { DataCollection } from './DataCollection'
import DataModelListener = require("./DataModelListener");
import DataCollectionChangeListener = require("./DataCollectionChangeListener");
import { DataModel } from "./DataModel";

export class DataComponentUpdater implements DataModelListener, DataCollectionChangeListener<DataModel>
{
  protected collections:DataCollection<DataModel>[] = []
  protected dataModels:DataModel[] = []
  
  constructor(collections?:DataCollection<DataModel>[]|DataCollection<DataModel>)
  {
    if (collections)
    {
      if (collections instanceof Array)
      {
        collections.forEach((collection) => {
          this.addCollection(collection)
        })
      }
      else
      {
        this.addCollection(collections)
      }
    }
  }

  public addCollection(collection:DataCollection<DataModel>)
  {
    collection.addChangeListener(this)
    this.collections.push(collection)
  }

  public addDataModel(dataModel:DataModel)
  {
    dataModel.addListener(this, true)
    this.dataModels.push(dataModel)
  }

  public destroy()
  {
    this.collections.forEach((collection) => {
      collection.removeChangeListener(this)
    })
    this.collections.slice(0, 0)


    this.dataModels.forEach((dataModel) => {
      dataModel.removeListener(this)
    })
    this.dataModels.slice(0, 0)
  }

  dataModelChanged(dataModel:DataModel)
  {
  }

  dataCollectionChanged(dataCollection:DataCollection<DataModel>, forceTriggerChildren?:boolean)
  {
  }
}
