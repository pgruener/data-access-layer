import Promise = require('Promise')
import { HttpMethod } from './HttpMethod';

export interface BackendConnector
{
  getConcreteRequestMethod(method:HttpMethod):Function
  get<T>(apiPath: string):Promise<T>
}
