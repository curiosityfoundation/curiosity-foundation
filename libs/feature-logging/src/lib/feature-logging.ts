import * as T from '@effect-ts/core/Effect';
import { has } from '@effect-ts/core/Classic/Has';
import * as L from '@effect-ts/core/Effect/Layer';

export type Logger = {
    info: (message: string) => T.UIO<void>;
    warn: (message: string) => T.UIO<void>;
    verbose: (message: string) => T.UIO<void>;
};

export const Logger = has<Logger>();

export const LoggerLive = ({ info, warn, verbose }: {
    info: (message: string) => any;
    warn: (message: string) => any;
    verbose: (message: string) => any;
}) =>
    L.fromConstructor(Logger)(() => ({
        info: (message: string) => T.asUnit(T.effectTotal(() => info(message))),
        warn: (message: string) => T.asUnit(T.effectTotal(() => warn(message))),
        verbose: (message: string) => T.asUnit(T.effectTotal(() => verbose(message))),
    }))();

export const {
    info,
    warn,
    verbose,
} = T.deriveLifted(Logger)(
    ['info', 'verbose', 'warn'],
    [] as never[],
    [] as never[],
);