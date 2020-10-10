import * as T from '@effect-ts/core/Effect';
import * as E from '@effect-ts/core/Classic/Either';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { DeviceResult, DeviceMessage } from '@curiosity-foundation/types-messages';
import { cycle } from '@curiosity-foundation/effect-ts-cycle';
import { log } from '@curiosity-foundation/service-logger';
import { listen, CommunicationAction, CommunicationEvent, getHistory, publish } from '@curiosity-foundation/service-communication';

import { State } from './data';
import { AppConfig, AppConfigURI } from './constants';

export const receiveDeviceResults = cycle<State, CommunicationAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => CommunicationAction.is.StartListening(a)
            ? pipe(
                S.access(({ [AppConfigURI]: config }: AppConfig) => config),
                S.chain((config) => pipe(
                    listen([config.readChannel]),
                    S.merge(getHistory(config.readChannel, 200)),
                )),
                S.mapConcat(CommunicationEvent.matchStrict({
                    presence: () => [],
                    publishResponse: () => [],
                    message: (ev) => pipe(
                        ev.message,
                        DeviceResult.type.decode,
                        E.fold(
                            () => [],
                            (msg) => [msg],
                        ),
                    ),
                    status: () => [],
                    historyMessage: (ev) => pipe(
                        ev.entry,
                        DeviceResult.type.decode,
                        E.fold(
                            () => [],
                            (msg) => [msg],
                        ),
                    ),
                })),
            )
            : S.fromArray([]))
    ));

export const publishDeviceActions = cycle<State, DeviceMessage>()(
    (action$) => pipe(
        action$,
        S.chain((a) => DeviceMessage.is.StartPump(a) || DeviceMessage.is.StopPump(a)
            ? pipe(
                S.access(({ [AppConfigURI]: config }) => config),
                S.mapM((config) => publish(config.writeChannel, a)),
            )
            : S.fromArray([]))
    ),
);
