import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';
import * as winston from 'winston';
import * as Pubnub from 'pubnub';

import { Logger, LoggerURI } from '@curiosity-foundation/service-logger';
import { Communication, CommunicationURI } from '@curiosity-foundation/service-communication';

import { app } from './app';
import { DeviceConfig, DeviceConfigURI } from './app/constants';

pipe(
    app,
    T.provide<Communication & Logger & DeviceConfig>({
        [LoggerURI]: winston.createLogger({
            transports: [new winston.transports.Console({
                level: 'verbose',
            })],
        }),
        [CommunicationURI]: new Pubnub({
            publishKey: String(process.env.PUBNUB_PUB_KEY),
            subscribeKey: String(process.env.PUBNUB_SUB_KEY),
            uuid: String(process.env.BALENA_DEVICE_NAME_AT_INIT),
        }),
        [DeviceConfigURI]: {
            readChannel: String(process.env.READ_CHANNEL),
            writeChannel: String(process.env.WRITE_CHANNEL),
            readInterval: Number(process.env.SENSOR_READ_INTERVAL),
        },
    }),
    T.runPromiseExit,
).then(
    console.log,
    console.warn,
);
