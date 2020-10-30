import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import type { nanoid } from 'nanoid';

import { UUID } from '@curiosity-foundation/feature-uuid'

export const NanoidUUIDLive = (n: typeof nanoid) =>
  L.pure(UUID)({
    generate: T.effectTotal(n),
  })
