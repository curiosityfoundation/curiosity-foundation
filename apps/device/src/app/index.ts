import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { publish } from '@curiosity-foundation/feature-messaging';
import { info } from '@curiosity-foundation/feature-logging';
import { DeviceAction, ResultAction } from '@curiosity-foundation/feature-device-io';
import { readSPI, writePin } from '@curiosity-foundation/feature-device-io';

import { checkWifiAndConnectIfNotConnected } from './wifi';
import { messagingActions } from './messaging';
import { scheduledActions } from './scheduled';
import { accessAppConfigM } from './config';

const logAndPublish = (msg: string) => (res: ResultAction) => pipe(
    accessAppConfigM((config) => pipe(
        info(msg),
        T.andThen(publish(config.writeChannel, res)),
    )),
    T.asUnit,
    S.fromEffect,
);

const handleDeviceMessage = DeviceAction.matchStrict({
    StartPump: () => pipe(
        writePin(4, 'ON'),
        T.map(() => ResultAction.of.PumpStarted({})),
        T.catchAllCause(() => T.succeed(ResultAction.of.DeviceFailure({}))),
        S.fromEffect,
    ),
    StopPump: () => pipe(
        writePin(4, 'OFF'),
        T.map(() => ResultAction.of.PumpStopped({})),
        T.catchAllCause(() => T.succeed(ResultAction.of.DeviceFailure({}))),
        S.fromEffect,
    ),
    TakeReading: ({ payload }) => pipe(
        payload.type === 'light'
            ? readSPI(0)
            : readSPI(5),
        S.map((value) => ResultAction.of.ReadingTaken({
            payload: {
                type: payload.type,
                value,
                taken: new Date(),
            },
        })),
    ),
});

const handleDeviceResult = ResultAction.matchStrict({
    PumpStarted: logAndPublish('pump started'),
    PumpStopped: logAndPublish('pump stopped'),
    ReadingTaken: logAndPublish('moisture reading taken'),
    DeviceFailure: logAndPublish('failure'),
});

export const app = pipe(
    checkWifiAndConnectIfNotConnected,
    T.andThen(pipe(
        messagingActions,
        S.merge(scheduledActions),
        S.chain(handleDeviceMessage),
        S.chain(handleDeviceResult),
        S.runDrain,
    )),
);

export { AppConfigLive } from './config';