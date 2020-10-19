import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';

import { verbose } from '@curiosity-foundation/feature-logging';

import { accessRPIOM } from './client';

export const acquirePin = (pin: number) => pipe(
    verbose(`acquiring gpio ${pin}`),
    T.andThen(accessRPIOM(({ client }) =>
        T.effectPartial(() => `failed to release gpio ${pin}`)(
            () => { client.open(pin, rpio.OUTPUT, rpio.LOW); },
        )),
    ));

export const releasePin = (pin: number) => () => pipe(
    verbose(`releasing gpio ${pin}`),
    T.andThen(accessRPIOM(({ client }) =>
        T.effectPartial(() => `failed to release gpio ${pin}`)(
            () => { client.close(pin); },
        )),
    ));

export const writePin = (pin: number, value: 'ON' | 'OFF') => pipe(
    verbose(`writing ${value} to gpio ${pin}`),
    T.andThen(accessRPIOM(({ client }) =>
        T.effectPartial(() => `failed to write ${value} to gpio ${pin}`)(
            () => { client.write(pin, value === 'OFF' ? 0 : 1); },
        ),
    )),
);
