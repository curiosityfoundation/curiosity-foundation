import * as M from '@effect-ts/morphic';

const ReadingType_ = M.make((F) => F.interface({
    type: F.oneOfLiterals<['moisture', 'light']>([
        'moisture',
        'light',
    ]),
}, { name: 'ReadingType' }));

export interface ReadingType extends M.AType<typeof ReadingType_> { }
export interface ReadingTypeRaw extends M.EType<typeof ReadingType_> { }
export const ReadingType = M.opaque<ReadingTypeRaw, ReadingType>()(ReadingType_);

const Reading_ = M.make((F) => F.intersection([
    ReadingType(F),
    F.interface({
        value: F.number(),
        taken: F.date(),
    }),
], { name: 'Reading' }));

export interface Reading extends M.AType<typeof Reading_> { }
export interface ReadingRaw extends M.EType<typeof Reading_> { }
export const Reading = M.opaque<ReadingRaw, Reading>()(Reading_);
