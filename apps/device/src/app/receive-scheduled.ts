import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as Schedule from '@effect-ts/system/Schedule';

import { DeviceMessage } from '@curiosity-foundation/types-messages';
import { log } from '@curiosity-foundation/service-logger';

import { DeviceConfig, DeviceConfigURI } from './constants';

export const receiveScheduledMessages = pipe(
    T.access(({ [DeviceConfigURI]: config }: DeviceConfig) => config),
    T.tap((config) => log(`starting fixed schedule of ${config.readInterval}ms`)),
    T.map((config) => pipe(
        S.fromSchedule(Schedule.fixed(config.readInterval)),
        S.mapConcat(() => [
            DeviceMessage.of.TakeMoistureReading({}),
            DeviceMessage.of.TakeLightReading({}),
        ]),
    )),
);
