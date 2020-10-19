import { constTrue, pipe } from '@effect-ts/core/Function';
import * as A from '@effect-ts/core/Classic/Array';
import * as M from '@effect-ts/morphic';
import * as L from '@effect-ts/monocle/Lens';

import { Reading } from './model';

const DeviceIOState_ = M.make((F) => F.interface({
    moistureReadings: F.array(Reading(F)),
    lightReadings: F.array(Reading(F)),
    pumpRunning: F.boolean(),
    err: F.boolean(),
}, { name: 'DeviceIOState' }));

export interface DeviceIOState extends M.AType<typeof DeviceIOState_> { }
export interface DeviceIOStateRaw extends M.EType<typeof DeviceIOState_> { }
export const DeviceIOState = M.opaque<DeviceIOStateRaw, DeviceIOState>()(DeviceIOState_);

export const setPumpRunning = (on: boolean) => pipe(
    L.id<DeviceIOState>(),
    L.prop('pumpRunning'),
    L.modify(() => on),
);

export const appendLightReading = (reading: Reading) => pipe(
    L.id<DeviceIOState>(),
    L.prop('lightReadings'),
    L.modify(A.snoc(reading)),
);

export const appendMoistureReading = (reading: Reading) => pipe(
    L.id<DeviceIOState>(),
    L.prop('moistureReadings'),
    L.modify(A.snoc(reading)),
);

export const setErrorTrue = pipe(
    L.id<DeviceIOState>(),
    L.prop('err'),
    L.modify(constTrue),
);
