import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Stream'
import { pipe } from '@effect-ts/core/Function';

import { DeviceResult, PumpStarted } from '@curiosity-foundation/types-messages';
import { cycle } from '@curiosity-foundation/effect-ts-cycle';
import { log } from '@curiosity-foundation/service-logger';

import { State } from './data';

export const logPumpStarted = cycle<State, PumpStarted>()(
    (action$) =>
        pipe(
            action$,
            S.mapM((a) => pipe(
                T.effectTotal(() => {
                    console.log(a);
                }),
                T.andThen(T.succeed(a)),
            ))
        ),
);

const logTap = <A>(a: A) => pipe(
    T.effectTotal(() => {
        console.log(a);
    }),
    T.andThen(log('test')),
    T.andThen(T.succeed(a)),
);

export const logMoistureReadings = cycle<State, DeviceResult>()(
    (action$) =>
        pipe(
            action$,
            S.mapM(logTap),
            S.mapConcat(() => [])
        ),
);
