import { has } from '@effect-ts/core/Classic/Has'
import * as T from '@effect-ts/core/Effect'
import * as M from '@effect-ts/core/Effect/Managed'
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import type { MongoClient as MongoClient_ } from 'mongodb';

export interface MongoClient {
    client: MongoClient_;
}

export const MongoClient = has<MongoClient>();

export const accessMongoClient = T.accessService(MongoClient);
export const accessMongoClientM = T.accessServiceM(MongoClient);

const managedMongo = (client_: MongoClient_) => M.make(
    ({ client }: MongoClient) =>
        T.effectAsync<unknown, never, void>((cb) => {
            client.close().finally(() => cb(T.unit))
        })
)(
    T.effectAsync<unknown, unknown, MongoClient>((cb) => {
        client_.connect().finally(
            () => cb(T.succeed({ client: client_ }))
        )
    }),
);

export const MongoClientLive = (client_: MongoClient_) => pipe(
    managedMongo(client_),
    L.fromManaged(MongoClient),
);
