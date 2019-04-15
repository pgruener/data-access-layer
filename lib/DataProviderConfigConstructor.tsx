import { DataProviderConfig } from "./DataProviderConfig";
import { QueueWorker } from "./QueueWorker";

export interface DataProviderConfigConstructor {
  new(dataProviderName:string, queueWorker:QueueWorker): DataProviderConfig
}