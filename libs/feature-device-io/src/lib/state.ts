import { constTrue, pipe } from '@effect-ts/core/Function';
import * as A from '@effect-ts/core/Classic/Array';
import * as M from '@effect-ts/morphic';
import * as L from '@effect-ts/monocle/Lens';

import { Reading } from './model';

const State_ = M.make((F) => F.interface({
    moistureReadings: F.array(Reading(F)),
    lightReadings: F.array(Reading(F)),
    pumpRunning: F.boolean(),
    err: F.boolean(),
}, { name: 'State' }));

export interface State extends M.AType<typeof State_> { }
export interface StateRaw extends M.EType<typeof State_> { }
export const State = M.opaque<StateRaw, State>()(State_);

export const setPumpRunning = (on: boolean) => pipe(
    L.id<State>(),
    L.prop('pumpRunning'),
    L.modify(() => on),
);

export const appendLightReading = (reading: Reading) => pipe(
    L.id<State>(),
    L.prop('lightReadings'),
    L.modify(A.snoc(reading)),
);

export const appendMoistureReading = (reading: Reading) => pipe(
    L.id<State>(),
    L.prop('moistureReadings'),
    L.modify(A.snoc(reading)),
);

export const setErrorTrue = pipe(
    L.id<State>(),
    L.prop('err'),
    L.modify(constTrue),
);
