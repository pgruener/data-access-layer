import { RequestDataStatus } from './internal'
export interface RequestInformation {
  id: string
  status: RequestDataStatus
  removeFromQueue: () => void
  repeatRequest: () => void
}
