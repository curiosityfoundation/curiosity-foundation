import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as Schedule from '@effect-ts/core/Effect/Schedule';

import { DeviceAction } from '@curiosity-foundation/feature-device-io';
import { info } from '@curiosity-foundation/feature-logging';

import { accessAppConfigM } from './config';

export const scheduledActions = pipe(
    accessAppConfigM((config) => pipe(
        info(`starting fixed schedule of ${config.readInterval}ms`),
        T.andThen(pipe(
            S.fromSchedule(Schedule.fixed(config.readInterval)),
            S.mapConcat(() => [
                DeviceAction.of.TakeReading({ payload: { type: 'moisture' } }),
                DeviceAction.of.TakeReading({ payload: { type: 'light' } }),
            ]),
            T.succeed,
        )),
    )),
    S.fromEffect,
    S.flatten,
);
