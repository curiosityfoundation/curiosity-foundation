import * as T from '@effect-ts/core/Effect'
import { tag } from '@effect-ts/core/Has'

export interface UUID {
  generate: T.UIO<string> 
}

export const UUID = tag<UUID>();

export const accessUUID = T.accessService(UUID)
export const accessUUIDM = T.accessServiceM(UUID)
