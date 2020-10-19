import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { cycle } from '@curiosity-foundation/effect-ts-cycle';
import {
    MessagingAction,
    MessagingEvent,
    getHistory,
    listen,
    publish,
} from '@curiosity-foundation/feature-messaging';
import {
    DeviceAction,
    ResultAction,
    decodeResultAction,
    State,
} from '@curiosity-foundation/feature-device-io';

import { accessAppConfig } from './config';

export const receiveDeviceResults = cycle<State, MessagingAction, ResultAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => MessagingAction.is.StartListening(a)
            ? pipe(
                accessAppConfig((config) => config),
                S.fromEffect,
                S.chain((config) => pipe(
                    listen([config.readChannel]),
                    S.merge(getHistory(config.readChannel, 200)),
                )),
                S.mapConcatM(MessagingEvent.matchStrict({
                    presence: () => T.succeed([]),
                    publishResponse: () => T.succeed([]),
                    message: (ev) => pipe(
                        ev.message,
                        decodeResultAction,
                        T.map((action) => [action]),
                        T.catchAll(() => T.succeed([])),
                    ),
                    status: () => T.succeed([]),
                    historyMessage: (ev) => pipe(
                        ev.entry,
                        decodeResultAction,
                        T.map((action) => [action]),
                        T.catchAll(() => T.succeed([])),
                    ),
                })),
            )
            : S.fromArray([]),
        ),
    ),
);

export const publishDeviceActions = cycle<State, DeviceAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => DeviceAction.is.StartPump(a) || DeviceAction.is.StopPump(a)
            ? pipe(
                accessAppConfig((config) => config),
                S.fromEffect,
                S.mapConcatM((config) => pipe(
                    publish(config.writeChannel, a),
                    T.andThen(T.succeed([])),
                )),
            )
            : S.fromArray([]))
    ),
);
