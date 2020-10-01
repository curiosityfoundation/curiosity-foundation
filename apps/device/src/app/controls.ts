import * as T from '@effect-ts/core/Effect';
import { ADTType, ofType, makeADT } from '@morphic-ts/adt';
import * as rpio from 'rpio';

type Start = {
    _tag: 'start';
};

type Stop = {
    _tag: 'stop';
};

export const PumpAction = makeADT('_tag')({
    start: ofType<Start>(),
    stop: ofType<Stop>(),
});

export type PumpAction = ADTType<typeof PumpAction>;

export const startPump = T.effectTotal(() => {
    rpio.write(4, 1);
});

export const stopPump = T.effectTotal(() => {
    rpio.write(4, 0);
});

export const controlPump = PumpAction.matchStrict({
    start: () => startPump,
    stop: () => stopPump,
});
