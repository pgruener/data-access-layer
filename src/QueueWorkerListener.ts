import { QueueState } from './internal'
export type QueueWorkerListener = (queueStates: QueueState[]) => void