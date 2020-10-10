import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { publish } from '@curiosity-foundation/service-communication';
import { log, warn } from '@curiosity-foundation/service-logger';
import { DeviceMessage, DeviceResult } from '@curiosity-foundation/types-messages';

import { runProcess } from './run-process';
import { startPump, stopPump } from './io/gpio';
import { takeReading } from './io/spi';
import { receiveCommunicatedMessages } from './receive-communicated';
import { receiveScheduledMessages } from './receive-scheduled';
import { DeviceConfig, DeviceConfigURI, Env } from './constants';

const checkWifiAndConnectIfNotConnected = pipe(
    log('checking wifi connection'),
    T.andThen(pipe(
        runProcess('iwgetid', ['-r']),
        S.runDrain,
    )),
    T.andThen(log('a wifi connection exists')),
    T.orElse(() => pipe(
        log('a wifi connection does not exist, starting wifi connect'),
        T.andThen(pipe(
            runProcess(`${process.cwd()}/wifi-connect`, []),
            S.runDrain,
        )),
        T.orElse(() => warn('wifi connect exited with a non-zero error code')),
    )),
);

const logAndPublish = (msg: string) => (res: DeviceResult) => pipe(
    T.access(({ [DeviceConfigURI]: config }: DeviceConfig) => config),
    T.chain((config) => pipe(
        log(msg),
        T.andThen(publish(config.writeChannel, res)),
    )),
    T.asUnit,
    S.fromEffect,
);

const receiveDeviceMessages = pipe(
    S.unwrap<unknown, Env, DeviceMessage>(receiveScheduledMessages),
    S.merge(S.unwrap<unknown, Env, DeviceMessage>(receiveCommunicatedMessages as any)),
);

const handleDeviceMessage = DeviceMessage.matchStrict({
    StartPump: () => pipe(
        startPump,
        T.map(() => DeviceResult.of.PumpStarted({})),
        T.catchAllCause(() => T.succeed(DeviceResult.of.Failure({}))),
        S.fromEffect,
    ),
    StopPump: () => pipe(
        stopPump,
        T.map(() => DeviceResult.of.PumpStopped({})),
        T.catchAllCause(() => T.succeed(DeviceResult.of.Failure({}))),
        S.fromEffect,
    ),
    TakeLightReading: () => pipe(
        takeReading(0),
        S.map((value) => DeviceResult.of.LightReading({
            payload: {
                value,
                time: new Date(),
            },
        })),
    ),
    TakeMoistureReading: () => pipe(
        takeReading(5),
        S.map((value) => DeviceResult.of.MoistureReading({
            payload: {
                value,
                time: new Date(),
            },
        })),
    ),
});

const handleDeviceResult = DeviceResult.matchStrict({
    PumpStarted: logAndPublish('pump started'),
    PumpStopped: logAndPublish('pump stopped'),
    LightReading: logAndPublish('light reading taken'),
    MoistureReading: logAndPublish('moisture reading taken'),
    Failure: logAndPublish('failure'),
});

export const app = pipe(
    checkWifiAndConnectIfNotConnected,
    T.andThen(pipe(
        receiveDeviceMessages,
        S.chain(handleDeviceMessage),
        S.chain(handleDeviceResult),
        S.runDrain,
    )),
);
