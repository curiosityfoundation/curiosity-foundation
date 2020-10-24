import { tag } from '@effect-ts/core/Has'
import * as T from '@effect-ts/core/Effect'
import * as M from '@effect-ts/core/Effect/Managed'
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import type * as Pubnub from 'pubnub';

export interface PubnubClient {
    client: Pubnub;
}

export const PubnubClient = tag<PubnubClient>();

export const accessPubnubClient = T.accessService(PubnubClient);
export const accessPubnubClientM = T.accessServiceM(PubnubClient);

const managedPubnub = (client_: Pubnub) => M.make(
    ({ client }: PubnubClient) => T.effectTotal(() => {
        client.unsubscribeAll();
        client.stop();
    })
)(T.succeed({ client: client_ }));

export const PubnubClientLive = (client_: Pubnub) => pipe(
    managedPubnub(client_),
    L.fromManaged(PubnubClient),
);
