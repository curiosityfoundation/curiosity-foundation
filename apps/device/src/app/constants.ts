import { Logger } from '@curiosity-foundation/service-logger';
import { Communication } from '@curiosity-foundation/service-communication';
import { Has } from '@effect-ts/core/Classic/Has';
import { Clock } from '@effect-ts/core/Effect/Clock';

export const SensorConfigURI = 'SensorConfigUri';
export type SensorConfigURI = typeof SensorConfigURI;

export type SensorConfig = {
    [SensorConfigURI]: {
        readInterval: number;
    };
};

export type Env = Logger & SensorConfig & Communication & Has<Clock>;
