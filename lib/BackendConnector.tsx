import * as Promise from 'Promise'
import { RequestData } from './RequestData';

export interface BackendConnector
{
  doRequest<T>(requestData:RequestData<T>, queueName?:string):Promise<T>
}
