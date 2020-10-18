import * as M from '@effect-ts/morphic';
import { encoder } from '@effect-ts/morphic/Encoder';
import { strictDecoder } from '@effect-ts/morphic/StrictDecoder';

const Id_ = M.make((F) => F.interface({
    _id: F.string(),
}, { name: 'Id' }));

export interface Id extends M.AType<typeof Id_> { }
export interface IdRaw extends M.EType<typeof Id_> { }
export const Id = M.opaque<IdRaw, Id>()(Id_);

export const encodeId = encoder(Id).encode;
export const decodeId = strictDecoder(Id).decode;

const Timestamp_ = M.make((F) => F.interface({
    created: F.date(),
    modified: F.nullable(F.date()),
}, { name: 'Timestamp' }));

export interface Timestamp extends M.AType<typeof Timestamp_> { }
export interface TimestampRaw extends M.EType<typeof Timestamp_> { }
export const Timestamp = M.opaque<TimestampRaw, Timestamp>()(Timestamp_);

export const encodeTimestamp = encoder(Timestamp).encode;
export const decodeTimestamp = strictDecoder(Timestamp).decode;
