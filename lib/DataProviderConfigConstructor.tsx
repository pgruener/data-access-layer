import { DataProviderConfig } from "./DataProviderConfig";
import { BackendConnector } from "./BackendConnector";

export interface DataProviderConfigConstructor {
  new(dataProviderName:string, backendConnector:BackendConnector): DataProviderConfig
}