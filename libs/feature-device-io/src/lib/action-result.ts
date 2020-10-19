import * as M from '@effect-ts/morphic';
import { encoder } from '@effect-ts/morphic/Encoder';
import { strictDecoder } from '@effect-ts/morphic/StrictDecoder';

import { makeAction, makePayloadAction } from '@curiosity-foundation/util-types';

import { Reading } from './model';

const ReadingTaken_ = makePayloadAction(
    'ReadingTaken',
    M.make((F) => Reading(F)),
);

export interface ReadingTaken extends M.AType<typeof ReadingTaken_> { }
export interface ReadingTakenRaw extends M.EType<typeof ReadingTaken_> { }
export const ReadingTaken = M.opaque<ReadingTakenRaw, ReadingTaken>()(ReadingTaken_);

export const decodeReadingTaken = strictDecoder(ReadingTaken).decode;
export const encodeReadingTaken = encoder(ReadingTaken).encode;

const PumpStopped_ = makeAction('PumpStopped');

export interface PumpStopped extends M.AType<typeof PumpStopped_> { }
export interface PumpStoppedRaw extends M.EType<typeof PumpStopped_> { }
export const PumpStopped = M.opaque<PumpStoppedRaw, PumpStopped>()(PumpStopped_);

export const decodePumpStopped = strictDecoder(PumpStopped).decode;
export const encodePumpStopped = encoder(PumpStopped).encode;

const PumpStarted_ = makeAction('PumpStarted');

export interface PumpStarted extends M.AType<typeof PumpStarted_> { }
export interface PumpStartedRaw extends M.EType<typeof PumpStarted_> { }
export const PumpStarted = M.opaque<PumpStartedRaw, PumpStarted>()(PumpStarted_);

export const decodePumpStarted = strictDecoder(PumpStarted).decode;
export const encodePumpStarted = encoder(PumpStarted).encode;

const DeviceFailure_ = makeAction('DeviceFailure');

export interface DeviceFailure extends M.AType<typeof DeviceFailure_> { }
export interface DeviceFailureRaw extends M.EType<typeof DeviceFailure_> { }
export const DeviceFailure = M.opaque<DeviceFailureRaw, DeviceFailure>()(DeviceFailure_);

export const decodeDeviceFailure = strictDecoder(DeviceFailure).decode;
export const encodeDeviceFailure = encoder(DeviceFailure).encode;

export const ResultAction = M.makeADT('type')({
    ReadingTaken,
    PumpStopped,
    PumpStarted,
    DeviceFailure,
});

export type ResultAction = M.AType<typeof ResultAction>;

export const decodeResultAction = strictDecoder(ResultAction).decode;
export const encodeResultAction = encoder(ResultAction).encode;
