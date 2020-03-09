import { RequestInformation } from './internal'
export interface QueueState {
  queueName: string
  requestInformations: RequestInformation[]
}
