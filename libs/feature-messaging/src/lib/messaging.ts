import { has } from '@effect-ts/core/Classic/Has';
import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import type { HistoryMessage } from 'pubnub';

import { verbose } from '@curiosity-foundation/feature-logging';

import { accessPubnubClient, accessPubnubClientM } from './client';
import { MessagingEvent } from './model';

const makeMessaging = () => ({
    subscribe: (channels: string[]) => pipe(
        verbose(`subscribing to channels ${channels}`),
        T.andThen(accessPubnubClientM(({ client }) =>
            T.effectTotal(() => client.subscribe({ channels })),
        )),
    ),
    unsubscribe: (channels: string[]) => pipe(
        verbose(`unsubscribing to channels ${channels}`),
        T.andThen(accessPubnubClientM(({ client }) =>
            T.effectTotal(() => client.unsubscribe({ channels })),
        )),
    ),
    publish: (channel: string, message: unknown) => pipe(
        accessPubnubClientM(({ client }) =>
            T.fromPromise(() => client.publish({
                channel,
                message,
            })),
        ),
    ),
});

export interface Messaging
    extends ReturnType<typeof makeMessaging> { }

export const Messaging = has<Messaging>()

export const MessagingLive = L.fromConstructor(Messaging)(
    makeMessaging,
)()

export const { subscribe, unsubscribe, publish } = T.deriveLifted(
    Messaging
)(['subscribe', 'unsubscribe', 'publish'], [] as never[], [] as never[]);

export const listen = (channels: string[]) => pipe(
    S.bracket(() => unsubscribe(channels))(subscribe(channels)),
    S.chain(() => S.fromEffect(accessPubnubClient(({ client }) => client))),
    S.chain((client) => S.effectAsync<{}, unknown, MessagingEvent>((cb) => {
        client.addListener({
            status: (ev) => cb(T.succeed([MessagingEvent.of.status(ev)])),
            message: (ev) => cb(T.succeed([MessagingEvent.of.message(ev)])),
            presence: (ev) => cb(T.succeed([MessagingEvent.of.presence({ state: null, ...ev })])),
        });
    })),
);

export const getHistory = (channel: string, count: number) => pipe(
    S.fromEffect(accessPubnubClient(({ client }) => client)),
    S.chain((client) => S.effectAsync<{}, unknown, HistoryMessage>((cb) => {
        client.history({
            channel,
            count,
        }).then(
            (response) => {
                cb(T.succeed(response.messages));
                cb(T.fail(O.none));
            },
            (err) => {
                console.log('ERROR!!!', err);
                cb(T.fail(O.none))
            },
        );
    })),
    S.map(MessagingEvent.of.historyMessage),
);