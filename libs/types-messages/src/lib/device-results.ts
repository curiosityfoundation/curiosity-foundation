import { summonFor } from '@morphic-ts/batteries/lib/summoner-BASTJ';
import * as t from 'io-ts';

const { summon, tagged } = summonFor<{}>({});

export const MoistureReading = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('MoistureReading'),
            value: F.number(),
        },
        'MoistureReading',
    ),
);

export type MoistureReading = t.TypeOf<typeof MoistureReading.type>;

export const LightReading = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('LightReading'),
            value: F.number(),
        },
        'LightReading',
    ),
);

export type LightReading = t.TypeOf<typeof LightReading.type>;

export const PumpStarted = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('PumpStarted'),
        },
        'PumpStarted',
    ),
);

export type PumpStarted = t.TypeOf<typeof PumpStarted.type>;

export const PumpStopped = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('PumpStopped'),
        },
        'PumpStopped',
    ),
);

export type PumpStopped = t.TypeOf<typeof PumpStopped.type>;

export const DeviceResults = tagged('_tag')({
    MoistureReading,
    LightReading,
    PumpStarted,
    PumpStopped,
});

export type DeviceResults = t.TypeOf<typeof DeviceResults.type>;
