import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';
import * as winston from 'winston';

export const LoggerURI = 'LoggerURI';
export type LoggerURI = typeof LoggerURI;

export type Logger = {
    [LoggerURI]: winston.Logger;
};

export const log = (message: string) => pipe(
    T.access(({ [LoggerURI]: logger }: Logger) => logger),
    T.chain((logger) => T.effectTotal(() => { logger.log('info', message); })),
);

export const warn = (message: string) => pipe(
    T.access(({ [LoggerURI]: logger }: Logger) => logger),
    T.chain((logger) => T.effectTotal(() => { logger.warn('info', message); })),
);
