import * as M from '@effect-ts/morphic'

const UnclaimedLicense_ = M.make((F) => F.interface({
    id: F.string(),
    deviceId: F.string(),
    created: F.date(),
}, { name: 'UnclaimedLicense' }));

export interface UnclaimedLicense extends M.AType<typeof UnclaimedLicense_> { }
export interface UnclaimedLicenseRaw extends M.EType<typeof UnclaimedLicense_> { }
export const UnclaimedLicense = M.opaque<UnclaimedLicenseRaw, UnclaimedLicense>()(UnclaimedLicense_);

const ClaimedLicense_ = M.make((F) => F.interface({
    id: F.string(),
    deviceId: F.string(),
    claimedBy: F.string(),
    claimed: F.date(),
    created: F.date(),
}, { name: 'ClaimedLicense' }));

export interface ClaimedLicense extends M.AType<typeof ClaimedLicense_> { }
export interface ClaimedLicenseRaw extends M.EType<typeof ClaimedLicense_> { }
export const ClaimedLicense = M.opaque<ClaimedLicenseRaw, ClaimedLicense>()(ClaimedLicense_);
