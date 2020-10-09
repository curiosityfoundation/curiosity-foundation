import * as A from 'fp-ts/Array';
import { constFalse, constTrue } from 'fp-ts/function';
import {  AType, EType } from '@morphic-ts/summoners';

import { summon, AsOpaque } from '@curiosity-foundation/morphic-redux';
import { DeviceResult, Reading } from '@curiosity-foundation/types-messages';

export const State_ = summon((F) => F.interface({
    moistureReadings: F.array(Reading(F)),
    lightReadings: F.array(Reading(F)),
    pumpRunning: F.boolean(),
    err: F.boolean(),
}, 'State'));
export interface State extends AType<typeof State_> {};
type StateRaw = EType<typeof State_>;
export const State = AsOpaque<StateRaw, State>()(State_);

export const init = State.build({
    moistureReadings: [],
    lightReadings: [],
    pumpRunning: false,
    err: false,
});

const monoidReadingArr = A.getMonoid<Reading>();
const append = (r: Reading) => (rs: Reading[]) => monoidReadingArr.concat(rs, [r]);

export const reducer = DeviceResult.createReducer(init)({
    PumpStarted: () => State.lensFromProp('pumpRunning').modify(constTrue),
    PumpStopped: () => State.lensFromProp('pumpRunning').modify(constFalse),
    MoistureReading: ({ payload }) => State.lensFromProp('moistureReadings').modify(append(payload)),
    LightReading: ({ payload }) => State.lensFromProp('lightReadings').modify(append(payload)),
    Failure: () => State.lensFromProp('err').modify(constTrue),
});
