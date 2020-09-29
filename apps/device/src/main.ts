import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';
import * as winston from 'winston';

import { app } from './app';
import { Logger, LoggerURI } from './app/logger';
import { CommunicationConfig, CommunicationConfigURI } from './app/communication';

pipe(
    app,
    T.provide<Logger & CommunicationConfig>({
        [LoggerURI]: winston.createLogger({
            transports: [
                new winston.transports.Console()
            ]
        }),
        [CommunicationConfigURI]: {
            publishKey: String(process.env.PUBNUB_PUB_KEY),
            subscribeKey: String(process.env.PUBNUB_SUB_KEY),
            uuid: 'raspi',
        },
    }),
    T.runPromiseExit,
).then(console.log, console.warn);
