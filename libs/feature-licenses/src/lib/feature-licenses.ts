import { summonFor, AsOpaque } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { AOfMorhpADT, AType, EType } from '@morphic-ts/summoners';

const { summon, tagged } = summonFor<{}>({});

const UnclaimedLicense_ = summon((F) =>
    F.interface(
        {
            id: F.string(),
            deviceId: F.string(),
            created: F.date(),
        },
        'UnclaimedLicense'
    ),
);
export interface UnclaimedLicense extends AType<typeof UnclaimedLicense_> { };
type UnclaimedLicenseRaw = EType<typeof UnclaimedLicense_>;
export const UnclaimedLicense = AsOpaque<UnclaimedLicenseRaw, UnclaimedLicense>()(UnclaimedLicense_);

const ClaimedLicense_ = summon((F) =>
    F.interface(
        {
            id: F.string(),
            deviceId: F.string(),
            claimedBy: F.string(),
            claimed: F.date(),
            created: F.date(),
        },
        'ClaimedLicense'
    ),
);
export interface ClaimedLicense extends AType<typeof ClaimedLicense_> { };
type ClaimedLicenseRaw = EType<typeof ClaimedLicense_>;
export const ClaimedLicense = AsOpaque<ClaimedLicenseRaw, ClaimedLicense>()(ClaimedLicense_);
