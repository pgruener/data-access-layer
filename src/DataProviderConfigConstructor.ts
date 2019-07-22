import { DataProviderConfig } from "./internal";
import { QueueWorker } from "./internal";

export interface DataProviderConfigConstructor {
  new(dataProviderName:string, queueWorker:QueueWorker):DataProviderConfig
}