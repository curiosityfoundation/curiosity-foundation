import { summonFor, AsOpaque } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { AOfMorhpADT, AType, EType } from "@morphic-ts/summoners";

const { summon, tagged } = summonFor<{}>({});

const TakeMoistureReading_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('TakeMoistureReading'),
        },
        'TakeMoistureReading',
    ),
);
export type TakeMoistureReading = AType<typeof TakeMoistureReading_>;
type TakeMoistureReadingRaw = EType<typeof TakeMoistureReading_>;
export const TakeMoistureReading = AsOpaque<TakeMoistureReadingRaw, TakeMoistureReading>()(TakeMoistureReading_);

const TakeLightReading_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('TakeLightReading'),
        },
        'TakeLightReading',
    ),
);
export type TakeLightReading = AType<typeof TakeLightReading_>;
type TakeLightReadingRaw = EType<typeof TakeLightReading_>;
export const TakeLightReading = AsOpaque<TakeLightReadingRaw, TakeLightReading>()(TakeLightReading_);

const StopPump_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('StopPump'),
        },
        'StopPump',
    ),
);
export type StopPump = AType<typeof StopPump_>;
type StopPumpRaw = EType<typeof StopPump_>;
export const StopPump = AsOpaque<StopPumpRaw, StopPump>()(StopPump_);

const StartPump_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('StartPump'),
        },
        'StartPump',
    ),
);
export type StartPump = AType<typeof StartPump_>;
type StartPumpRaw = EType<typeof StartPump_>;
export const StartPump = AsOpaque<StartPumpRaw, StartPump>()(StartPump_);

export const DeviceMessage = tagged('type')({
    TakeMoistureReading,
    TakeLightReading,
    StopPump,
    StartPump,
});

export type DeviceMessage = AOfMorhpADT<typeof DeviceMessage>;
