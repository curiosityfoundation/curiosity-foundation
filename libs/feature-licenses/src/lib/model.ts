import * as M from '@effect-ts/morphic'
import { Id, Timestamp} from '@curiosity-foundation/feature-db'
import { strictDecoder } from '@effect-ts/morphic/StrictDecoder'
import { encoder } from '@effect-ts/morphic/Encoder'

const DeviceId_ = M.make((F) => F.interface({
    deviceId: F.string(),
}, { name: 'DeviceId' }));

export interface DeviceId extends M.AType<typeof DeviceId_> { }
export interface DeviceIdRaw extends M.EType<typeof DeviceId_> { }
export const DeviceId = M.opaque<DeviceIdRaw, DeviceId>()(DeviceId_);

export const decodeDeviceId = strictDecoder(DeviceId).decode;
export const encodeDeviceId = encoder(DeviceId).encode;

const ClaimedBy_ = M.make((F) => F.interface({
    claimedBy: F.string(),
}, { name: 'ClaimedBy' }));

export interface ClaimedBy extends M.AType<typeof ClaimedBy_> { }
export interface ClaimedByRaw extends M.EType<typeof ClaimedBy_> { }
export const ClaimedBy = M.opaque<ClaimedByRaw, ClaimedBy>()(ClaimedBy_);

const UnclaimedLicense_ = M.make((F) => F.intersection([
    Id(F),
    Timestamp(F),
    DeviceId(F),
], { name: 'UnclaimedLicense' }));

export interface UnclaimedLicense extends M.AType<typeof UnclaimedLicense_> { }
export interface UnclaimedLicenseRaw extends M.EType<typeof UnclaimedLicense_> { }
export const UnclaimedLicense = M.opaque<UnclaimedLicenseRaw, UnclaimedLicense>()(UnclaimedLicense_);

export const decodeUnclaimedLicense = strictDecoder(UnclaimedLicense).decode;
export const encodeUnclaimedLicense = encoder(UnclaimedLicense).encode;

const UnclaimedLicenseList_ = M.make((F) => F.interface({
    unclaimedLicenses: F.array(UnclaimedLicense(F)),
}, { name: 'UnclaimedLicenseList' }));

export interface UnclaimedLicenseList extends M.AType<typeof UnclaimedLicenseList_> { }
export interface UnclaimedLicenseListRaw extends M.EType<typeof UnclaimedLicenseList_> { }
export const UnclaimedLicenseList = M.opaque<UnclaimedLicenseListRaw, UnclaimedLicenseList>()(UnclaimedLicenseList_);

export const decodeUnclaimedLicenseList = strictDecoder(UnclaimedLicenseList).decode;
export const encodeUnclaimedLicenseList = encoder(UnclaimedLicenseList).encode;

const InsertClaimedLicense_ = M.make((F) => F.intersection([
    DeviceId(F),
    ClaimedBy(F),
], { name: 'InsertClaimedLicense' }));

export interface InsertClaimedLicense extends M.AType<typeof InsertClaimedLicense_> { }
export interface InsertClaimedLicenseRaw extends M.EType<typeof InsertClaimedLicense_> { }
export const InsertClaimedLicense = M.opaque<InsertClaimedLicenseRaw, InsertClaimedLicense>()(InsertClaimedLicense_);

export const decodeInsertClaimedLicense = strictDecoder(InsertClaimedLicense).decode;
export const encodeInsertClaimedLicense = encoder(InsertClaimedLicense).encode;

const ClaimedLicense_ = M.make((F) => F.intersection([
    UnclaimedLicense(F),
    ClaimedBy(F),
], { name: 'ClaimedLicense' }));

export interface ClaimedLicense extends M.AType<typeof ClaimedLicense_> { }
export interface ClaimedLicenseRaw extends M.EType<typeof ClaimedLicense_> { }
export const ClaimedLicense = M.opaque<ClaimedLicenseRaw, ClaimedLicense>()(ClaimedLicense_);

export const decodeClaimedLicense = strictDecoder(ClaimedLicense).decode;
export const encodeClaimedLicense = encoder(ClaimedLicense).encode;

const ClaimedLicenseList_ = M.make((F) => F.interface({
    claimedLicenses: F.array(ClaimedLicense(F)),
}, { name: 'ClaimedLicenseList' }));

export interface ClaimedLicenseList extends M.AType<typeof ClaimedLicenseList_> { }
export interface ClaimedLicenseListRaw extends M.EType<typeof ClaimedLicenseList_> { }
export const ClaimedLicenseList = M.opaque<ClaimedLicenseListRaw, ClaimedLicenseList>()(ClaimedLicenseList_);

export const decodeClaimedLicenseList = strictDecoder(ClaimedLicenseList).decode;
export const encodeClaimedLicenseList = encoder(ClaimedLicenseList).encode;
