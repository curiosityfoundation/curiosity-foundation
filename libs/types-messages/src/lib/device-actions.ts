import { summonFor } from '@morphic-ts/batteries/lib/summoner-BASTJ';
import * as t from 'io-ts';

const { summon, tagged } = summonFor<{}>({});

export const TakeMoistureReading = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('TakeMoistureReading'),
        },
        'TakeMoistureReading',
    ),
);

export type TakeMoistureReading = t.TypeOf<typeof TakeMoistureReading.type>;

export const TakeLightReading = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('TakeLightReading'),
        },
        'TakeLightReading',
    ),
);

export type TakeLightReading = t.TypeOf<typeof TakeLightReading.type>;

export const StopPump = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('StopPump'),
        },
        'StopPump',
    ),
);

export type StopPump = t.TypeOf<typeof StopPump.type>;

export const StartPump = summon((F) =>
    F.interface(
        {
            _tag: F.stringLiteral('StartPump'),
        },
        'StartPump',
    ),
);

export type StartPump = t.TypeOf<typeof StartPump.type>;

export const DeviceMessage = tagged('_tag')({
    TakeMoistureReading,
    TakeLightReading,
    StopPump,
    StartPump,
});

export type DeviceMessage = t.TypeOf<typeof DeviceMessage.type>;
