import * as L from '@effect-ts/core/Effect/Layer'
import * as T from '@effect-ts/core/Effect'
import { pipe } from '@effect-ts/core/Function';
import * as O from '@effect-ts/core/Classic/Option'

import { createKVStorageError, KVStorage } from '@curiosity-foundation/feature-kv-storage';

export const LocalKVStorageLive = (window: Window) =>
  L.pure(KVStorage)({
    get: (key: string) => T.effectPartial(
      (err: Error) => pipe(
        err.message,
        createKVStorageError,
      )
    )(
      () => {
        const raw = window.localStorage.getItem(key)
        if (raw) {
          const value = JSON.parse(raw)
          return O.some(value)
        } else {
          return O.none
        }
      }
    ),
    set: (key: string, value: object) => T.effectPartial(
      (err: Error) => pipe(
        err.message,
        createKVStorageError,
      )
    )(
      () => {
        const raw = JSON.stringify(value)
        window.localStorage.setItem(key, raw)
      }
    ),
    clear: T.effectPartial(
      (err: Error) => pipe(
        err.message,
        createKVStorageError,
      )
    )(
      () => {
        window.localStorage.clear()
      }
    ),
  });
