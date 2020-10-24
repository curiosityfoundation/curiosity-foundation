import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';
import * as winston from 'winston';
import * as Pubnub from 'pubnub';
import * as RPIO from 'rpio';

import { LoggerLive } from '@curiosity-foundation/feature-logging';
import { PubnubClientLive } from '@curiosity-foundation/feature-messaging';
import { RPIOLive } from '@curiosity-foundation/feature-device-io';

import { app, AppConfigLive } from './app';

const provideAppConfig = pipe(
    {
        readChannel: String(process.env.READ_CHANNEL),
        writeChannel: String(process.env.WRITE_CHANNEL),
        readInterval: Number(process.env.SENSOR_READ_INTERVAL),
    },
    AppConfigLive,
    T.provideSomeLayer,
);

const provideLogger = pipe(
    winston.createLogger({
        transports: [new winston.transports.Console({
            level: 'verbose',
        })],
    }),
    LoggerLive,
    T.provideSomeLayer,
);

const provideMessaging = pipe(
    new Pubnub({
        publishKey: String(process.env.PUBNUB_PUB_KEY),
        subscribeKey: String(process.env.PUBNUB_SUB_KEY),
        uuid: String(process.env.BALENA_DEVICE_NAME_AT_INIT),
    }),
    PubnubClientLive,
    T.provideSomeLayer,
);

const provideRPIO = pipe(
    RPIO,
    RPIOLive,
    T.provideSomeLayer,
);

pipe(
    app,
    provideLogger,
    provideAppConfig,
    provideMessaging,
    provideRPIO,
    T.runPromiseExit,
).then(
    console.log,
    console.warn,
);
