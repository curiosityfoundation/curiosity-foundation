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