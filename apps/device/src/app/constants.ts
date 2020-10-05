import { HasClock } from '@effect-ts/core/Effect/Clock';

import { Logger } from '@curiosity-foundation/service-logger';
import { Communication } from '@curiosity-foundation/service-communication';

export const DeviceConfigURI = 'SensorConfigURI';
export type DeviceConfigURI = typeof DeviceConfigURI;

export type DeviceConfig = {
    [DeviceConfigURI]: {
        readChannel: string;
        writeChannel: string;
        readInterval: number;
    };
};

export type Env = Logger & DeviceConfig & Communication & HasClock;
