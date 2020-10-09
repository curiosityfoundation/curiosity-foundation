import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as rpio from 'rpio';
import { ADTType } from '@morphic-ts/adt';

import { verbose } from '@curiosity-foundation/service-logger';
import { DeviceMessage, DeviceResult } from '@curiosity-foundation/types-messages';

const acquirePin = pipe(
    verbose('acquiring gpio 4'),
    T.andThen(T.effectPartial(() => 'failed to release gpio 4')(
        () => {
            rpio.open(4, rpio.OUTPUT, rpio.LOW);
        })),
    T.catchAllCause((cause) => T.succeed(DeviceResult.of.Failure({ cause })))
);

const releasePin = () => pipe(
    verbose('releasing gpio 4'),
    T.andThen(T.effectPartial(() => 'failed to release gpio 4')(
        () => {
            rpio.close(4);
        })),
    T.catchAllCause((cause) => T.succeed(DeviceResult.of.Failure({ cause })))
);

const writeHigh = (pin: number) => pipe(
    verbose(`writing ${rpio.HIGH} to gpio ${pin}`),
    T.andThen(T.effectTotal(() => {
        rpio.write(pin, rpio.HIGH);
    })),
    T.map(() => DeviceResult.of.PumpStarted({})),
    T.catchAllCause(() => T.succeed(DeviceResult.of.Failure({})))
);

const writeLow = (pin: number) => pipe(
    verbose(`writing ${rpio.LOW} to gpio ${pin}`),
    T.andThen(T.effectTotal(() => {
        rpio.write(pin, rpio.LOW);
    })),
);

export const stopPump = pipe(
    S.bracket(releasePin)(acquirePin),
    S.chain(() => S.fromEffect(writeLow(4))),
    S.runDrain,
);

export const startPump = pipe(
    S.bracket(releasePin)(acquirePin),
    S.chain(() => S.fromEffect(writeHigh(4))),
    S.runDrain,
);
