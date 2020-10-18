import * as M from '@effect-ts/morphic';

import { makeAction, makePayloadAction } from '@curiosity-foundation/util-types';
import { UnclaimedLicense } from './model';

const FetchUnclaimedLicenses_ = makeAction('FetchUnclaimedLicenses');

export interface FetchUnclaimedLicenses extends M.AType<typeof FetchUnclaimedLicenses_> { }
export interface FetchUnclaimedLicensesRaw extends M.EType<typeof FetchUnclaimedLicenses_> { }
export const FetchUnclaimedLicenses = M.opaque<FetchUnclaimedLicensesRaw, FetchUnclaimedLicenses>()(FetchUnclaimedLicenses_);

const FetchUnclaimedLicensesFailure_ = makePayloadAction(
    'FetchUnclaimedLicensesFailure',
    M.make((F) => F.interface({
        name: F.string(),
        message: F.string(),
    })),
);

export interface FetchUnclaimedLicensesFailure extends M.AType<typeof FetchUnclaimedLicensesFailure_> { }
export interface FetchUnclaimedLicensesFailureRaw extends M.EType<typeof FetchUnclaimedLicensesFailure_> { }
export const FetchUnclaimedLicensesFailure = M.opaque<FetchUnclaimedLicensesFailureRaw, FetchUnclaimedLicensesFailure>()(FetchUnclaimedLicensesFailure_);

const FetchUnclaimedLicensesSuccess_ = makePayloadAction(
    'FetchUnclaimedLicensesSuccess',
    M.make((F) => F.record(UnclaimedLicense(F))),
);

export interface FetchUnclaimedLicensesSuccess extends M.AType<typeof FetchUnclaimedLicensesSuccess_> { }
export interface FetchUnclaimedLicensesSuccessRaw extends M.EType<typeof FetchUnclaimedLicensesSuccess_> { }
export const FetchUnclaimedLicensesSuccess = M.opaque<FetchUnclaimedLicensesSuccessRaw, FetchUnclaimedLicensesSuccess>()(FetchUnclaimedLicensesSuccess_);

export const LicensesAction = M.makeADT('type')({
    FetchUnclaimedLicenses,
    FetchUnclaimedLicensesFailure,
    FetchUnclaimedLicensesSuccess,
});

export type LicensesAction = M.AType<typeof LicensesAction>;
