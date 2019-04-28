import { BackendConnector } from "./BackendConnector";
import { DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME } from "./Constants";
import { RequestData } from "./RequestData";
import { DataModelRequestData } from "./DataModelRequestData";
import { DataModel } from "./DataModel";
import { ObjectMap } from "./ObjectMap";

/**
 * The QueueWorker is the single entry point for the data access layer to talk to its {@link BackendConnector}.
 * All incoming requests are queued and are running in the sequence they are added (FIFO).
 * The code adding the request can decide, if it should run in a seperate queue by setting a queueName.
 * 
 * There is just one instance of QueueWorker per {@link DataCollectionFactory}.
 * @class QueueWorker
 * @see DataCollectionFactory
 */
export class QueueWorker
{
  private requestQueues:{[s:string]: RequestData<DataModel>[]} = {}

  private backendConnector:BackendConnector
  constructor(backendConnector:BackendConnector)
  {
    this.backendConnector = backendConnector
  }

  /**
   * Adds the request to the request queue.
   * 
   * @method doRequest
   * @param {RequestData} requestData 
   * @param {string} [queueName] defaults to 'default' from DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME constant
   */
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

  /**
   * Gets the first RequestData object from the queue with the given queue name 
   * and triggers the {@link BackendConnector} to do the request.
   * 
   * @method doRequestIntern
   * @param {string} queueName to be processed
   */
  private doRequestIntern(queueName:string)
  {
    let queue = this.requestQueues[queueName]

    let requestData = queue[0]

    if (requestData instanceof DataModelRequestData)
    {
      requestData.dataModel.informAboutRequest(requestData)
    }

    this.backendConnector.doRequest(requestData).done((response:Object) => {

      let hasResponse = response != null

      if (hasResponse)
      {
        if (response instanceof Array)
        {
          requestData.handleResponse(response as ObjectMap[])
        }
        else
        {
          requestData.handleResponse(response as ObjectMap)
        }
      }

      this.onAfterRequestDone(queueName, !hasResponse)
    }, (reason:any) => {
      console.log('Rejected...', reason)
    })
  }

  /**
   * Removes the first object from the queue with the given queue name and starts
   * the next queue cycle, if there are objects left in the queue. 
   * 
   * @method onAfterRequestDone
   * @param {string} queueName
   * @param {boolean} [skipReduceQueue]
   */
  private onAfterRequestDone(queueName:string, skipReduceQueue?:boolean)
  {
    let queue = this.requestQueues[queueName]

    if (!skipReduceQueue)
    {
      queue.shift()
    }

    if (queue.length > 0)
    {
      this.doRequestIntern(queueName)
    }
  }
}