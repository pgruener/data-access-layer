import { DataCollection } from './DataCollection'
import { DataModel } from './DataModel';
import { DataModelListener } from "./DataModelListener";

export class RootDataCollection<T extends DataModel> extends DataCollection<T> implements DataModelListener
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

  public mergeEntities(newEntities:T[])
  {
    let map:{[s:string]: T} = {}
    this.allEntities.forEach((entity) => {
      map[entity.computeIdentityHashCode()] = entity
    })

    newEntities.forEach((entity:T) => {
      let availableEntity = map[entity.computeIdentityHashCode()]
      if (availableEntity)
      {
        availableEntity.mergeModel(entity)
      }
      else
      {
        entity.addListener(this)
        this.allEntities = this.allEntities.concat(entity)
      }
    })

    this.storeEntitiesAndApplyFilters(this.allEntities)
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
