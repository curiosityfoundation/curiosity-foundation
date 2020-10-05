import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as rpio from 'rpio';
import { ADTType } from '@morphic-ts/adt';

import { verbose } from '@curiosity-foundation/service-logger';
import { DeviceMessage, DeviceResult } from '@curiosity-foundation/types-messages';

const acquirePin = pipe(
    verbose('acquiring rpio 4'),
    T.andThen(T.effectPartial(() => 'failed to release rpio 4')(
        () => {
            rpio.open(4, rpio.OUTPUT, rpio.LOW);
        })),
    T.catchAllCause((cause) => T.succeed(DeviceResult.of.Failure({ cause })))
);

const releasePin = () => pipe(
    verbose('releasing rpio 4'),
    T.andThen(T.effectPartial(() => 'failed to release rpio 4')(
        () => {
            rpio.close(4);
        })),
    T.catchAllCause((cause) => T.succeed(DeviceResult.of.Failure({ cause })))
);

const startPump = pipe(
    verbose(`writing ${rpio.HIGH} to rpio 4`),
    T.andThen(T.effectTotal(() => {
        rpio.write(4, rpio.HIGH);
    })),
    T.map(() => DeviceResult.of.PumpStarted({})),
    T.catchAllCause(() => T.succeed(DeviceResult.of.Failure({})))
);

const stopPump = pipe(
    verbose(`writing ${rpio.LOW} to rpio 4`),
    T.andThen(T.effectTotal(() => {
        rpio.write(4, rpio.LOW);
    })),
    T.map(() => DeviceResult.of.PumpStopped({})),
    T.catchAllCause(() => T.succeed(DeviceResult.of.Failure({})))
);

const PumpMessage = DeviceMessage.select([
    'StartPump',
    'StopPump',
]);

type PumpMessage = ADTType<typeof PumpMessage>;

export const handlePumpMessage = (msg: PumpMessage) =>
    pipe(
        S.bracket(releasePin)(acquirePin),
        S.chain(() => pipe(
            msg,
            PumpMessage.match({
                StartPump: () => startPump,
                StopPump: () => stopPump,
            }),
            S.fromEffect,
        )),
    );
