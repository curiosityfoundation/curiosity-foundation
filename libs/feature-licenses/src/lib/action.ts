import * as M from '@effect-ts/morphic';

import { makeAction, makePayloadAction } from '@curiosity-foundation/util-types';
import { UnclaimedLicense, UnclaimedLicenseList } from './model';

const FetchUnclaimedLicenses_ = makeAction('FetchUnclaimedLicenses');

export interface FetchUnclaimedLicenses extends M.AType<typeof FetchUnclaimedLicenses_> { }
export interface FetchUnclaimedLicensesRaw extends M.EType<typeof FetchUnclaimedLicenses_> { }
export const FetchUnclaimedLicenses = M.opaque<FetchUnclaimedLicensesRaw, FetchUnclaimedLicenses>()(FetchUnclaimedLicenses_);

const FetchUnclaimedLicensesInflight_ =  makeAction('FetchUnclaimedLicensesInflight');

export interface FetchUnclaimedLicensesInflight extends M.AType<typeof FetchUnclaimedLicensesInflight_> { }
export interface FetchUnclaimedLicensesInflightRaw extends M.EType<typeof FetchUnclaimedLicensesInflight_> { }
export const FetchUnclaimedLicensesInflight = M.opaque<FetchUnclaimedLicensesInflightRaw, FetchUnclaimedLicensesInflight>()(FetchUnclaimedLicensesInflight_);

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
    M.make((F) => UnclaimedLicenseList(F)),
);

export interface FetchUnclaimedLicensesSuccess extends M.AType<typeof FetchUnclaimedLicensesSuccess_> { }
export interface FetchUnclaimedLicensesSuccessRaw extends M.EType<typeof FetchUnclaimedLicensesSuccess_> { }
export const FetchUnclaimedLicensesSuccess = M.opaque<FetchUnclaimedLicensesSuccessRaw, FetchUnclaimedLicensesSuccess>()(FetchUnclaimedLicensesSuccess_);

export const LicensesAction = M.makeADT('type')({
    FetchUnclaimedLicenses,
    FetchUnclaimedLicensesInflight,
    FetchUnclaimedLicensesFailure,
    FetchUnclaimedLicensesSuccess,
});

export type LicensesAction = M.AType<typeof LicensesAction>;
