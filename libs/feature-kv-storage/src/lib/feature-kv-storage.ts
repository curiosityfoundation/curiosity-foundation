import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import { tag } from '@effect-ts/core/Has'
import * as O from '@effect-ts/core/Classic/Option'

export interface KVStorageError {
  reason: string;
}

export const createKVStorageError = (reason: string): KVStorageError =>
  ({ reason });

export interface KVStorage {
  get(key: string): T.IO<KVStorageError, O.Option<unknown>>;
  set(key: string, data: object): T.IO<KVStorageError, void>;
  clear: T.IO<KVStorageError, void>;
}

export const KVStorage = tag<KVStorage>();
