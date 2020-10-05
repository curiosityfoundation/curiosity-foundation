import * as A from 'fp-ts/Array';
import { constFalse, constTrue } from 'fp-ts/function';

import { summon } from '@curiosity-foundation/morphic-redux';
import { DeviceResult, Reading } from '@curiosity-foundation/types-messages';

export const State = summon((F) => F.interface({
    moistureReadings: F.array(Reading(F)),
    lightReadings: F.array(Reading(F)),
    pumpRunning: F.boolean(),
    err: F.boolean(),
}, 'State'));

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
