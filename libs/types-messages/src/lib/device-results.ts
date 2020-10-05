import { summonFor, AsOpaque } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { AOfMorhpADT, AType, EType } from "@morphic-ts/summoners";

const { summon, tagged } = summonFor<{}>({});

const Reading_ = summon((F) =>
    F.interface(
        {
            value: F.number(),
            time: F.date(),
        },
        'Reading',
    ),
);
export type Reading = AType<typeof Reading_>;
type ReadingRaw = EType<typeof Reading_>;
export const Reading = AsOpaque<ReadingRaw, Reading>()(Reading_);

const MoistureReading_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('MoistureReading'),
            payload: Reading(F),
        },
        'MoistureReading',
    ),
);
export type MoistureReading = AType<typeof MoistureReading_>;
type MoistureReadingRaw = EType<typeof MoistureReading_>;
export const MoistureReading = AsOpaque<MoistureReadingRaw, MoistureReading>()(MoistureReading_);

const LightReading_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('LightReading'),
            payload: Reading(F),
        },
        'LightReading',
    ),
);
export type LightReading = AType<typeof LightReading_>;
type LightReadingRaw = EType<typeof LightReading_>;
export const LightReading = AsOpaque<LightReadingRaw, LightReading>()(LightReading_);

const PumpStarted_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('PumpStarted'),
        },
        'PumpStarted',
    ),
);
export type PumpStarted = AType<typeof PumpStarted_>;
type PumpStartedRaw = EType<typeof PumpStarted_>;
export const PumpStarted = AsOpaque<PumpStartedRaw, PumpStarted>()(PumpStarted_);

const PumpStopped_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('PumpStopped'),
        },
        'PumpStopped',
    ),
);
export type PumpStopped = AType<typeof PumpStopped_>;
type PumpStoppedRaw = EType<typeof PumpStopped_>;
export const PumpStopped = AsOpaque<PumpStoppedRaw, PumpStopped>()(PumpStopped_);

const Failure_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('Failure'),
        },
        'Failure'
    ),
);
export type Failure = AType<typeof Failure_>;
type FailureRaw = EType<typeof Failure_>;
export const Failure = AsOpaque<FailureRaw, Failure>()(Failure_);

export const DeviceResult = tagged('type')({
    MoistureReading,
    LightReading,
    PumpStarted,
    PumpStopped,
    Failure,
});

export type DeviceResult = AOfMorhpADT<typeof DeviceResult>;
