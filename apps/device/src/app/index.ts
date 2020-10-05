import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { publish } from '@curiosity-foundation/service-communication';
import { log, warn } from '@curiosity-foundation/service-logger';
import { DeviceMessage, DeviceResult } from '@curiosity-foundation/types-messages';

import { runProcess } from './run-process';
import { handleTakeReadingMessage } from './sensors';
import { handlePumpMessage } from './pump';
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

const receiveDeviceMessages = S.merge(
    S.unwrap<unknown, Env, DeviceMessage>(receiveScheduledMessages))(
        S.unwrap<unknown, Env, DeviceMessage>(receiveCommunicatedMessages),
    );

const handleDeviceMessage = DeviceMessage.matchStrict({
    StartPump: handlePumpMessage,
    StopPump: handlePumpMessage,
    TakeLightReading: handleTakeReadingMessage,
    TakeMoistureReading: handleTakeReadingMessage,
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
