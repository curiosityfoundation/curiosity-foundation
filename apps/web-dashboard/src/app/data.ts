import * as A from 'fp-ts/Array';
import { constFalse, constTrue } from 'fp-ts/function';
import { AOfMorhpADT, AType, EType } from "@morphic-ts/summoners";

import { summon, AsOpaque, tagged } from '@curiosity-foundation/morphic-redux';
import { DeviceResult, Reading } from '@curiosity-foundation/types-messages';
import { CommunicationAction } from '@curiosity-foundation/service-communication';
import { restyle } from 'plotly.js';

export const State_ = summon((F) => F.interface({
    moistureReadings: F.array(Reading(F)),
    lightReadings: F.array(Reading(F)),
    pumpRunning: F.boolean(),
    err: F.boolean(),
}, 'State'));
export interface State extends AType<typeof State_> { };
type StateRaw = EType<typeof State_>;
export const State = AsOpaque<StateRaw, State>()(State_);

export const init = State.build({
    moistureReadings: [],
    lightReadings: [],
    pumpRunning: false,
    err: false,
});

const MAX_READINGS = 50;

const monoidReadingArr = A.getMonoid<Reading>();
const append = (r: Reading) => ([h, ...rs]: Reading[]) =>
    !h
        ? [r]
        : rs.length >= MAX_READINGS
            ? [...rs, r]
            : [h, ...rs, r];

export const reducer = DeviceResult.createReducer(init)({
    PumpStarted: () => State.lensFromProp('pumpRunning').modify(constTrue),
    PumpStopped: () => State.lensFromProp('pumpRunning').modify(constFalse),
    MoistureReading: ({ payload }) => State.lensFromProp('moistureReadings').modify(append(payload)),
    LightReading: ({ payload }) => State.lensFromProp('lightReadings').modify(append(payload)),
    Failure: () => State.lensFromProp('err').modify(constTrue),
});
