import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { communicate } from './communication';
import { runProcess } from './run-process';
import { sense } from './sense';
import { log, warn } from './logger';

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

const senseAndReport = pipe(
    log('starting sensors'),
    T.andThen(
        pipe(
            communicate(
                pipe(
                    sense,
                    S.chain(([i0, i1, i2, i3, i4, i5, i6, i7]) => S.fromArray([
                        {
                            device: '123',
                            sensor: 0,
                            reading: i0,
                        },
                        {
                            device: '123',
                            sensor: 5,
                            reading: i5,
                        }
                    ])),
                ),
            ),
            T.chain((s) => pipe(
                s,
                S.chain((ev) => S.fromEffect(log(`communication response: ${JSON.stringify(ev)}`))),
                S.runCollect,
            )),
        ),
    ),
);

export const app = pipe(
    checkWifiAndConnectIfNotConnected,
    T.andThen(senseAndReport),
);

