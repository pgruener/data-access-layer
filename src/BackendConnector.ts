import * as Promise from 'Promise'
import { RequestData } from './internal';

/**
 * The application using the data access layer must provide an instance
 * of a class implementing a BackendConnector.
 * 
 * The BackendConnector is responsible to retreive the desired data from the backend.
 * It receives an instance of {@link RequestData} to compute, what kind of request is needed.
 * @interface BackendConnector
 */
export interface BackendConnector
{
  doRequest<T>(requestData:RequestData<T>, queueName?:string):Promise<T>
}
