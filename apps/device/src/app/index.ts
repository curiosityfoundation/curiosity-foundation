import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { CommunicationEvent, listen, publish } from './communication';
import { runProcess } from './run-process';
import { readFromSensors } from './sensors';
import { log, warn } from './logger';
import { PumpAction, startPump, stopPump } from './controls';

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

const readFromSensorsAndBroadcastReadings = pipe(
    readFromSensors,
    S.chain(([moisture, light]) => S.fromEffect(publish(({
        device: '123',
        readings: { moisture, light },
    })))),
);

export const app = pipe(
    checkWifiAndConnectIfNotConnected,
    T.andThen(T.succeed(pipe(
        S.concatAll([
            readFromSensorsAndBroadcastReadings,
            S.unwrap(listen),
        ])
    ))),
    T.chain((ev$) => T.collectAll([
        pipe(
            ev$,
            S.map(CommunicationEvent.matchStrict({
                status: (status) => log(`received status: ${JSON.stringify(status)}`),
                presence: (presence) => log(`received presence: ${JSON.stringify(presence)}`),
                message: (message) => log(`received message: ${JSON.stringify(message)}`),
                publishResponse: (response) => log(`received publish response: ${JSON.stringify(response)}`),
            })),
            S.chain(S.fromEffect),
            S.runDrain,
        ),
        pipe(
            ev$,
            S.chain((ev) => CommunicationEvent.is.message(ev)
                ? pipe(
                    ev.message,
                    PumpAction.matchStrict({
                        start: () => startPump,
                        stop: () => stopPump,
                    }),
                )
                : S.empty,
            ),
            S.runDrain,
        ),
    ]))
    // T.chain()
    //     S.chain((ev) => S.concatAll([
    //         pipe(
    //             ev,
    //             CommunicationEvent.matchStrict({
    //                 status: (status) => log(`received status: ${JSON.stringify(status)}`),
    //                 presence: (presence) => log(`received presence: ${JSON.stringify(presence)}`),
    //                 message: (message) => log(`received message: ${JSON.stringify(message)}`),
    //                 publishResponse: (response) => log(`received publish response: ${JSON.stringify(response)}`),
    //             }),
    //             S.fromEffect,
    //         ),
    //         pipe(
    //             ev,
    //             CommunicationEvent.is.
    //     ])),
    //     S.runDrain,
    // )),
    // T.asUnit,
);
