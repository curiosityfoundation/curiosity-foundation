import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as Schedule from '@effect-ts/core/Effect/Schedule';

import { DeviceMessage } from '@curiosity-foundation/types-messages';
import { info } from '@curiosity-foundation/feature-logging';

import { accessAppConfigM } from './config';

export const receiveScheduledMessages = pipe(
    accessAppConfigM((config) => pipe(
        info(`starting fixed schedule of ${config.readInterval}ms`),
        T.andThen(pipe(
            S.fromSchedule(Schedule.fixed(config.readInterval)),
            S.mapConcat(() => [
                DeviceMessage.of.TakeMoistureReading({}),
                DeviceMessage.of.TakeLightReading({}),
            ]),
            T.succeed,
        ))
    ))
);
