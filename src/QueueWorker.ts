import { BackendConnector } from "./internal";
import { DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME } from "./internal";
import { RequestData } from "./internal";
import { DataModelRequestData } from "./internal";
import { DataModel } from "./internal";
import { ObjectMap } from "./internal";
import { QueueState } from './internal'
import { QueueWorkerListener } from './internal'
import { UrlRequestData } from './internal'
import { RequestInformation } from './internal'

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
  private requestQueues: {
    [s: string]: {
      requests: RequestData<DataModel>[]
      active: boolean
    }
  } = {}
  private queueTimeoutIds: {[s: string]: number} = {}

  private backendConnector:BackendConnector

  private queueWorkerListeners: Array<QueueWorkerListener> = []
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
    
    if (!this.requestQueues[queueName]) {
      this.requestQueues[queueName] = {
        requests: [],
        active: false
      }
    }

    let queue: RequestData<DataModel>[] = this.requestQueues[queueName].requests

    queue.push(requestData)

    if (!this.requestQueues[queueName].active)
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
    this.queueTimeoutIds[queueName] = undefined
    let requestData = this.requestQueues[queueName].requests[0]
    // if (!requestData) {
    //   setActive(false)
    //   return;
    // }


    this.requestQueues[queueName].active = true

    if (requestData) { // Because we can now remove requests in the queue with this.deleteRequestDataFromQueue
      if (!requestData.isPending() && !requestData.isError()) {
        this.requestQueues[queueName].active = false
        return
      }
      requestData.setActive()
      this.activateQueueWorkerListeners()
  
      if (requestData instanceof DataModelRequestData)
      {
        requestData.dataModel.informAboutRequest(requestData)
      }
  
      this.backendConnector.doRequest(requestData).done((response:Object) => {
  
        let hasResponse = response != null
  
        if (hasResponse)
        {
          requestData.setClientTimestamp()
          if (response instanceof Array)
          {
            requestData.handleResponse(response as ObjectMap[])
          }
          else
          {
            requestData.handleResponse(response as ObjectMap)
          }
        }
  
        requestData.setFinished()
  
        this.onAfterRequestDone(queueName, !hasResponse)
      }, (reason: {status: number, statusText: string }, retry?: boolean) => {
        requestData.setError()
        this.activateQueueWorkerListeners()
        if (requestData.isRetryable()) {
          console.log(`Rejected. Retrying ... (${requestData.RetryAmount}) tries`, reason)
          this.queueTimeoutIds[queueName] = window.setTimeout(() => this.doRequestIntern(queueName), requestData.calculateRetryWaitTime())
        } else {
          this.requestQueues[queueName].active = false
          console.log('Rejected.', reason)
        }
      })
    } else {
      this.requestQueues[queueName].active = false
    }
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
    let queue = this.requestQueues[queueName].requests

    if (!skipReduceQueue)
    {
      queue.shift()
    }

    this.activateQueueWorkerListeners()

    if (queue.length > 0)
    {
      if (queue[0] instanceof UrlRequestData) {
        this.doRequestIntern(queueName)
      } else {
        this.queueTimeoutIds[queueName] = window.setTimeout(() => this.doRequestIntern(queueName), 1100) //Bad Workorround to don't have the merge issues with time stamps
      }
    } else {
      this.requestQueues[queueName].active = false
    }
  }

  public removeQueueWorkerListener = (queueWorkerListener: QueueWorkerListener):void => {
    let index: number = this.queueWorkerListeners.indexOf(queueWorkerListener)
    if (index > -1) {
      this.queueWorkerListeners.splice(index, 1)
    }
  }

  public addQueueWorkerListener = (queueWorkerListener: QueueWorkerListener):void => {
    this.removeQueueWorkerListener(queueWorkerListener)
    this.queueWorkerListeners.push(queueWorkerListener)
  }

  public computeActualQueueStates = ():QueueState[] => {
    let queueStates: QueueState[] = []
    Object.keys(this.requestQueues).forEach((queueName: string) => {
      let requestInformations: RequestInformation[] = []
      this.requestQueues[queueName].requests.forEach((requestData: RequestData<DataModel>) => requestInformations.push({
        id: requestData.id,
        status: requestData.Status,
        removeFromQueue: () => this.deleteRequestDataFromQueue(requestData, queueName),
        repeatRequest: () => this.forceRepeatingRequest(requestData, queueName)
      }))
      queueStates.push({
        queueName: queueName,
        requestInformations: requestInformations
      })
    })
    return queueStates
  }

  private activateQueueWorkerListeners = ():void => {
    let queueStates: QueueState[] = this.computeActualQueueStates()
    this.queueWorkerListeners.forEach((queueWorkerListener: QueueWorkerListener) => queueWorkerListener(queueStates))
  }

  private deleteRequestDataFromQueue = (requestData: RequestData<DataModel>, queueName: string):void => {
    if (!requestData.isActive()) {
      let queue: RequestData<DataModel>[] = this.requestQueues[queueName].requests
      let index: number = queue.indexOf(requestData)
      if (index > -1) {
        queue.splice(index, 1)
        this.activateQueueWorkerListeners()
        if (index == 0) {
          let queueTimeoutId: number = this.queueTimeoutIds[queueName]
          window.clearTimeout(queueTimeoutId)
          if ((queueTimeoutId || !this.requestQueues[queueName].active) && queue.length > 0) {
            // The merge issue can happen here unfortunatly
            this.doRequestIntern(queueName)
          }
        }
      }
    }
  }

  private forceRepeatingRequest = (requestData: RequestData<DataModel>, queueName: string) => {
    if (requestData.isError()) {
      let index: number = this.requestQueues[queueName].requests.indexOf(requestData)
      if (index == 0) {
        requestData.resetRetryAmount()
        let queueTimeoutId: number = this.queueTimeoutIds[queueName]
        window.clearTimeout(queueTimeoutId)
        if (queueTimeoutId || !this.requestQueues[queueName].active) {
          // The merge issue can happen here unfortunatly
          this.doRequestIntern(queueName)
        }
      }
    }
  }
}
