import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';
import * as winston from 'winston';
import * as Pubnub from 'pubnub';

import { app } from './app';
import { Logger, LoggerURI } from './app/logger';
import { Communication, CommunicationURI } from './app/communication';
import { SensorConfig, SensorConfigURI } from './app/sensors';

pipe(
    app,
    T.provide<Logger & Communication & SensorConfig>({
        [LoggerURI]: winston.createLogger({
            transports: [new winston.transports.Console()],
        }),
        [CommunicationURI]: new Pubnub({
            publishKey: String(process.env.PUBNUB_PUB_KEY),
            subscribeKey: String(process.env.PUBNUB_SUB_KEY),
            uuid: String(process.env.BALENA_DEVICE_NAME_AT_INIT),
        }),
        [SensorConfigURI]: {
            readInterval: Number(process.env.SENSOR_READ_INTERVAL),
        },
    }),
    T.runPromiseExit,
).then(console.log, console.warn);
