import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import type { HistoryResponse } from 'pubnub';

import { verbose } from '@curiosity-foundation/feature-logging';
import { DeviceAction, ResultAction } from '@curiosity-foundation/feature-device-io';

import { accessPubnubClient, accessPubnubClientM } from './client';
import { MessagingEvent } from './model';

export const subscribe = (channels: string[]) => pipe(
    verbose(`subscribing to channels ${channels}`),
    T.andThen(accessPubnubClientM(({ client }) =>
        T.effectTotal(() => client.subscribe({ channels })),
    )),
);

export const unsubscribe = (channels: string[]) => pipe(
    verbose(`unsubscribing to channels ${channels}`),
    T.andThen(accessPubnubClientM(({ client }) =>
        T.effectTotal(() => client.unsubscribe({ channels })),
    )),
);

export const publish = (channel: string, message: DeviceAction | ResultAction) =>
    pipe(
        verbose(`publishing ${message.type} to ${channel}`),
        T.andThen(pipe(
            accessPubnubClientM(({ client }) =>
                T.fromPromise(() => client.publish({
                    channel,
                    message,
                })),
            ),
            T.tap((response) =>
                verbose(`published ${message.type} to ${channel} at ${response.timetoken}`)),
        )),
    );

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
    S.mapM((event) => pipe(
        verbose(`${event._tag} event received from ${channels}`),
        T.andThen(T.succeed(event)),
    )),
);

export const getHistory = (channel: string, count: number) => pipe(
    S.fromEffect(accessPubnubClient(({ client }) => client)),
    S.chain((client) => S.effectAsync<{}, unknown, HistoryResponse>((cb) => {
        client.history({
            channel,
            count,
        }).then(
            (response) => {
                cb(T.succeed([response]));
                cb(T.fail(O.none));
            },
            (err) => {
                // TODO: handle errors here
                cb(T.fail(O.none))
            },
        );
    })),
    S.mapConcatM((response) => pipe(
        verbose(`${response.messages.length} of the ${count} requested history messages were received from ${channel}`),
        T.andThen(T.succeed(response.messages)),
    )),
    S.map(MessagingEvent.of.historyMessage),
);