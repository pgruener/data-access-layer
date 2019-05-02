import { DataCollection } from './internal'
import { DataModelListener } from "./internal";
import { DataCollectionChangeListener } from "./internal";
import { DataModel } from "./internal";

/**
 * DataComponentUpdater registers as listener for models and collections added.
 * It also handles deregistration by easily call destroy-method.
 * 
 * The change handling must be implemented in concrete subclasses, as in our provided RXComponentUpdater.
 * 
 * @abstract
 * @class DataComponentUpdater
 */
export abstract class DataComponentUpdater implements DataModelListener, DataCollectionChangeListener<DataModel>
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

  abstract dataModelChanged(dataModel:DataModel):void
  abstract dataCollectionChanged(dataCollection:DataCollection<DataModel>, forceTriggerChildren?:boolean):void
}
