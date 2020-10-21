import * as A from '@effect-ts/core/Classic/Array';
import { eqString } from '@effect-ts/core/Classic/Equal';
import * as O from '@effect-ts/core/Classic/Option';
import * as R from '@effect-ts/core/Classic/Record';
import { pipe } from '@effect-ts/core/Function';
import * as M from '@effect-ts/morphic';

import { makeAsyncSlice, makeIdTable } from '@curiosity-foundation/util-types';

import { ClaimedLicense, ClaimedLicenseList } from './model';

const ClaimedLicensesError = M.make((F) => F.interface({
    name: F.string(),
    message: F.string(),
}));

const ClaimedLicenseTable = makeIdTable(ClaimedLicense);

const slice = makeAsyncSlice(
    'FetchClaimedLicenses',
    'FetchClaimedLicensesFailure',
    'FetchClaimedLicensesSuccess',
    'FetchClaimedLicensesReset',
    'FetchClaimedLicensesInflight',
)(
    ClaimedLicensesError,
    ClaimedLicenseTable,
)(
    ClaimedLicensesError,
    ClaimedLicenseList,
    (payload) => O.fold(
        () => ClaimedLicensesError.build(payload),
        () => ClaimedLicensesError.build(payload),
    ),
    (payload) => O.fold(
        () => ClaimedLicenseTable.build({
            byId: R.fromArray(pipe(
                payload.claimedLicenses,
                A.map((l) => [l._id, l] as [string, ClaimedLicense]),
            )),
            allIds: pipe(
                payload.claimedLicenses,
                A.map(({ _id }) => _id),
            ),
        }),
        (table) => ClaimedLicenseTable.build({
            byId: R.fromArray(pipe(
                R.toArray(table.byId),
                A.concat(pipe(
                    payload.claimedLicenses,
                    A.map((l) => [l._id, l] as [string, ClaimedLicense]),
                )),
            )),
            allIds: pipe(
                payload.claimedLicenses,
                A.map(({ _id }) => _id),
                A.concat(table.allIds),
                A.uniq(eqString),
            ),
        }),
    ),
);

export const {
    Action: ClaimedLicensesAction,
    State: ClaimedLicensesState,
    reducer: claimedLicensesReducer,
} = slice;

export type ClaimedLicensesAction = M.AType<typeof ClaimedLicensesAction>;
export type ClaimedLicensesState = M.AType<typeof ClaimedLicensesState>;
