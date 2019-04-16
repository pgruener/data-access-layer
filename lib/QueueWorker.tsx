import { BackendConnector } from "./BackendConnector";
import { DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME } from "./Constants";
import { RequestData, DataModelRequestData } from "./RequestData";
import { DataModel } from "./DataModel";
import { ObjectMap } from "./ObjectMap";

export class QueueWorker
{
  private requestQueues:{[s:string]: RequestData<DataModel>[]} = {}

  private backendConnector:BackendConnector
  constructor(backendConnector:BackendConnector)
  {
    this.backendConnector = backendConnector
  }

  doRequest<T extends DataModel>(requestData:RequestData<T>, queueName?:string)
  {
    queueName = queueName == undefined ? DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME : queueName

    let queue = this.requestQueues[queueName]

    if (!queue)
    {
      queue = this.requestQueues[queueName] = []
    }

    queue.push(requestData)

    if (queue.length == 1)
    {
      this.doRequestIntern(queueName)
    }
  }

  private doRequestIntern(queueName:string)
  {

    let queue = this.requestQueues[queueName]

    let requestData = queue[0]

    if (requestData instanceof DataModelRequestData)
    {
      requestData.dataModel.informAboutRequest(requestData)
    }


    this.backendConnector.doRequest(requestData).done((response:Object) => {

      if (response instanceof Array)
      {
        requestData.setResponse(response as ObjectMap[])
      }
      else
      {
        requestData.setResponse(response as ObjectMap)
      }

      // Success | Error

      this.onAfterRequestDone(queueName)
    })
  }

  private onAfterRequestDone(queueName:string)
  {
    let queue = this.requestQueues[queueName]

    queue.shift()

    if (queue.length > 0)
    {
      this.doRequestIntern(queueName)
    }
  }
}