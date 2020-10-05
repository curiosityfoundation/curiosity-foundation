import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import { HasClock } from '@effect-ts/core/Effect/Clock';

import { Communication, publish } from '@curiosity-foundation/service-communication';
import { log, Logger, warn } from '@curiosity-foundation/service-logger';
import { DeviceMessage, DeviceResults, } from '@curiosity-foundation/types-messages';

import { runProcess } from './run-process';
import { handleTakeReadingMessage, SensorConfig } from './sensors';
import { handlePumpMessage } from './pump';
import { receiveCommunicatedMessages } from './receive-communicated';
import { receiveScheduledMessages } from './receive-scheduled';

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

type Env = SensorConfig & Logger & Communication & HasClock;

export const app = pipe(
    checkWifiAndConnectIfNotConnected,
    T.andThen(pipe(
        S.unwrap<unknown, Env, DeviceMessage>(receiveCommunicatedMessages),
        S.merge(
            S.unwrap<unknown, Env, DeviceMessage>(receiveScheduledMessages),
        ),
        S.chain(DeviceMessage.matchStrict({
            StartPump: handlePumpMessage,
            StopPump: handlePumpMessage,
            TakeLightReading: handleTakeReadingMessage,
            TakeMoistureReading: handleTakeReadingMessage,
        })),
        S.map(DeviceResults.matchStrict({
            PumpStarted: (res) => pipe(
                log('pump started'),
                T.andThen(publish(
                    String(process.env.BALENA_DEVICE_NAME_AT_INIT),
                    res,
                )),
                T.asUnit,
            ),
            PumpStopped: (res) => pipe(
                log('pump stopped'),
                T.andThen(publish(
                    String(process.env.BALENA_DEVICE_NAME_AT_INIT),
                    res,
                )),
                T.asUnit,
            ),
            LightReading: (res) => pipe(
                log(`light reading taken ${res.value}`),
                T.andThen(publish(
                    String(process.env.BALENA_DEVICE_NAME_AT_INIT),
                    res,
                )),
                T.asUnit,
            ),
            MoistureReading: (res) => pipe(
                log(`moisture reading taken ${res.value}`),
                T.andThen(publish(
                    String(process.env.BALENA_DEVICE_NAME_AT_INIT),
                    res,
                )),
                T.asUnit,
            ),
        })),
        S.chain(S.fromEffect),
        S.runDrain,
    )),
);

// const readFromSensorsAndBroadcastReadings = pipe(
//     readFromSensors,
//     S.chain(([moisture, light]) => S.fromEffect(publish(
//         `${process.env.BALENA_DEVICE_NAME_AT_INIT}/moisture`,
//         SensorReading.of.MoistureReading({ value: moisture }),
//     ))),
// );

// const logCommunicationEvent = CommunicationEvent.matchStrict({
//     status: (status) => log(`received status: ${JSON.stringify(status)}`),
//     presence: (presence) => log(`received presence: ${JSON.stringify(presence)}`),
//     message: (message) => log(`received message: ${JSON.stringify(message)}`),
//     publishResponse: (response) => log(`received publish response: ${JSON.stringify(response)}`),
// });

// export const app = pipe(
//     checkWifiAndConnectIfNotConnected,
//     T.andThen(initPump),
//     T.andThen(T.succeed(
//         S.concatAll([
//             readFromSensorsAndBroadcastReadings,
//             S.unwrap(listen([`${process.env.BALENA_DEVICE_NAME_AT_INIT}/pump`])),
//         ]),
//     )),
//     T.chain((ev$) => T.collectAllPar([
//         pipe(
//             ev$,
//             S.map(logCommunicationEvent),
//             S.chain(S.fromEffect),
//             S.runDrain,
//         ),
//         pipe(
//             ev$,
//             S.chain((ev) => CommunicationEvent.is.message(ev)
//                 ? pipe(
//                     ev.message,
//                     DeviceMessage.type.decode,
//                     E.fold(
//                         (e) => log(e.reduce((acc, e) => `${acc} ${e.message}`, '')),
//                         controlPump,
//                     ),
//                     S.fromEffect,
//                 )
//                 : S.empty,
//             ),
//             S.runDrain,
//         ),
//     ])),
//     T.asUnit,
// );
