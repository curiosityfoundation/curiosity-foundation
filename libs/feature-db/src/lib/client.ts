import { has, Has } from '@effect-ts/core/Classic/Has'
import * as T from '@effect-ts/core/Effect'
import * as M from '@effect-ts/core/Effect/Managed'
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import * as mongodb from 'mongodb';

export interface MongoClient {
    client: mongodb.MongoClient;
}

export const MongoClient = has<MongoClient>();

export const accessMongoClient = T.accessService(MongoClient);
export const accessMongoClientM = T.accessServiceM(MongoClient);

const managedMongo = (connectionString: string) => M.make(
    ({ client }: MongoClient) =>
        T.effectAsync<unknown, never, void>((cb) => {
            client.close().finally(() => cb(T.unit))
        })
)(
    T.effectAsync<unknown, unknown, MongoClient>((cb) => {
        const client = new mongodb.MongoClient(
            connectionString,
            { useUnifiedTopology: true },
        );
        client.connect().finally(
            () => cb(T.succeed({ client }))
        )
    }),
);

export const MongoClientLive = (connectionString: string) => pipe(
    managedMongo(connectionString),
    L.fromManaged(MongoClient),
);
