import * as M from '@effect-ts/morphic';
import { encoder } from '@effect-ts/morphic/Encoder';
import { strictDecoder } from '@effect-ts/morphic/StrictDecoder';

import { makeAction, makePayloadAction } from '@curiosity-foundation/util-types';

import { ReadingType } from './model';

const TakeReading_ = makePayloadAction(
    'TakeReading',
    M.make((F) => ReadingType(F)),
);

export interface TakeReading extends M.AType<typeof TakeReading_> { }
export interface TakeReadingRaw extends M.EType<typeof TakeReading_> { }
export const TakeReading = M.opaque<TakeReadingRaw, TakeReading>()(TakeReading_);

export const decodeTakeReading = strictDecoder(TakeReading).decode;
export const encodeTakeReading = encoder(TakeReading).encode;

const StartPump_ = makeAction('StartPump');

export interface StartPump extends M.AType<typeof StartPump_> { }
export interface StartPumpRaw extends M.EType<typeof StartPump_> { }
export const StartPump = M.opaque<StartPumpRaw, StartPump>()(StartPump_);

export const decodeStartPump = strictDecoder(StartPump).decode;
export const encodeStartPump = encoder(StartPump).encode;

const StopPump_ = makeAction('StopPump');

export interface StopPump extends M.AType<typeof StopPump_> { }
export interface StopPumpRaw extends M.EType<typeof StopPump_> { }
export const StopPump = M.opaque<StopPumpRaw, StopPump>()(StopPump_);

export const decodeStopPump = strictDecoder(StopPump).decode;
export const encodeStopPump = encoder(StopPump).encode;

export const DeviceAction = M.makeADT('type')({
    TakeReading,
    StartPump,
    StopPump,
});

export type DeviceAction = M.AType<typeof DeviceAction>;

export const decodeDeviceAction = strictDecoder(DeviceAction).decode;
export const encodeDeviceAction = encoder(DeviceAction).encode;

