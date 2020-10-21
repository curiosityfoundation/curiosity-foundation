import * as A from '@effect-ts/core/Classic/Array';
import { eqString } from '@effect-ts/core/Classic/Equal';
import * as O from '@effect-ts/core/Classic/Option';
import * as R from '@effect-ts/core/Classic/Record';
import { pipe } from '@effect-ts/core/Function';
import * as M from '@effect-ts/morphic';

import { makeAsyncSlice, makeIdTable } from '@curiosity-foundation/util-types';

import { UnclaimedLicense, UnclaimedLicenseList } from './model';

const UnclaimedLicensesError = M.make((F) => F.interface({
    name: F.string(),
    message: F.string(),
}));

const UnclaimedLicenseTable = makeIdTable(UnclaimedLicense);

const slice = makeAsyncSlice(
    'FetchUnclaimedLicenses',
    'FetchUnclaimedLicensesFailure',
    'FetchUnclaimedLicensesSuccess',
    'FetchUnclaimedLicensesReset',
    'FetchUnclaimedLicensesInflight',
)(
    UnclaimedLicensesError,
    UnclaimedLicenseTable,
)(
    UnclaimedLicensesError,
    UnclaimedLicenseList,
    (payload) => O.fold(
        () => UnclaimedLicensesError.build(payload),
        () => UnclaimedLicensesError.build(payload),
    ),
    (payload) => O.fold(
        () => UnclaimedLicenseTable.build({
            byId: R.fromArray(pipe(
                payload.unclaimedLicenses,
                A.map((l) => [l._id, l] as [string, UnclaimedLicense]),
            )),
            allIds: pipe(
                payload.unclaimedLicenses,
                A.map(({ _id }) => _id),
            ),
        }),
        (table) => UnclaimedLicenseTable.build({
            byId: R.fromArray(pipe(
                R.toArray(table.byId),
                A.concat(pipe(
                    payload.unclaimedLicenses,
                    A.map((l) => [l._id, l] as [string, UnclaimedLicense]),
                )),
            )),
            allIds: pipe(
                payload.unclaimedLicenses,
                A.map(({ _id }) => _id),
                A.concat(table.allIds),
                A.uniq(eqString),
            ),
        }),
    ),
);

export const {
    Action: UnclaimedLicensesAction,
    State: UnclaimedLicensesState,
    reducer: unclaimedLicensesReducer,
} = slice;

export type UnclaimedLicensesAction = M.AType<typeof UnclaimedLicensesAction>;
export type UnclaimedLicensesState = M.AType<typeof UnclaimedLicensesState>;
