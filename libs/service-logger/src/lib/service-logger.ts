import * as T from '@effect-ts/core/Effect';
import { pipe } from '@effect-ts/core/Function';
import * as winston from 'winston';

export const LoggerURI = 'LoggerURI';
export type LoggerURI = typeof LoggerURI;

export type Logger = {
    [LoggerURI]: {
        info: (message: string) => any;
        warn: (message: string) => any;
        verbose: (message: string) => any;
    };
};

export const log = (message: string) => pipe(
    T.access(({ [LoggerURI]: logger }: Logger) => logger),
    T.chain((logger) => T.effectTotal(() => { logger.info(message); })),
    T.asUnit,
);

export const warn = (message: string) => pipe(
    T.access(({ [LoggerURI]: logger }: Logger) => logger),
    T.chain((logger) => T.effectTotal(() => { logger.warn(message); })),
    T.asUnit,
);

export const verbose = (message: string) => pipe(
    T.access(({ [LoggerURI]: logger }: Logger) => logger),
    T.chain((logger) => T.effectTotal(() => { logger.verbose(message); })),
    T.asUnit,
);
