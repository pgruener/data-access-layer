import { RequestDataStatus } from './internal'
export interface QueueState {
  queueName: string
  requestStates: RequestDataStatus[]
}
