import * as A from '@effect-ts/core/Classic/Array';
import * as R from '@effect-ts/core/Classic/Record';
import { eqString } from '@effect-ts/core/Classic/Equal';
import { pipe } from '@effect-ts/core/Function';

import { LicensesAction } from './action';
import { UnclaimedLicensesState } from './state';
import { UnclaimedLicense } from './model';

const init = UnclaimedLicensesState.of.InitState({})

export const unclaimedLicensesReducer = LicensesAction.createReducer(init)({
    FetchUnclaimedLicenses: () => (s) => s,
    FetchUnclaimedLicensesInflight: () => UnclaimedLicensesState.transform({
        InitState: () => UnclaimedLicensesState.of.PendingState({}),
        LeftState: ({ error }) => UnclaimedLicensesState.of.LeftState({
            refreshing: true,
            error,
        }),
        RightState: ({ unclaimedLicenses }) => UnclaimedLicensesState.of.RightState({
            refreshing: true,
            unclaimedLicenses,
        }),
        BothState: ({ unclaimedLicenses, error }) => UnclaimedLicensesState.of.BothState({
            refreshing: true,
            unclaimedLicenses,
            error,
        }),
    }),
    FetchUnclaimedLicensesFailure: ({ payload }) => UnclaimedLicensesState.transform({
        PendingState: () => UnclaimedLicensesState.of.LeftState({
            refreshing: false,
            error: payload.message,
        }),
        LeftState: () => UnclaimedLicensesState.of.LeftState({
            refreshing: false,
            error: payload.message,
        }),
        RightState: ({ unclaimedLicenses }) => UnclaimedLicensesState.of.BothState({
            refreshing: false,
            error: payload.message,
            unclaimedLicenses,
        }),
        BothState: ({ unclaimedLicenses }) => UnclaimedLicensesState.of.BothState({
            refreshing: false,
            error: payload.message,
            unclaimedLicenses,
        }),
    }),
    FetchUnclaimedLicensesSuccess: ({ payload }) => UnclaimedLicensesState.transform({
        PendingState: () => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: {
                byId: R.fromArray(pipe(
                    payload.unclaimedLicenses,
                    A.map((l) => [l._id, l]),
                )),
                allIds: pipe(
                    payload.unclaimedLicenses,
                    A.map(({ _id }) => _id),
                ),
            },
        }),
        LeftState: () => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: {
                byId: R.fromArray(pipe(
                    payload.unclaimedLicenses,
                    A.map((l) => [l._id, l]),
                )),
                allIds: pipe(
                    payload.unclaimedLicenses,
                    A.map(({ _id }) => _id),
                ),
            },
        }),
        RightState: ({ unclaimedLicenses }) => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: {
                byId: R.fromArray(pipe(
                    payload.unclaimedLicenses,
                    A.map((l) => [l._id, l] as [string, UnclaimedLicense]),
                    A.concat(R.toArray(unclaimedLicenses.byId)),
                )),
                allIds: pipe(
                    payload.unclaimedLicenses,
                    A.map(({ _id }) => _id),
                    A.concat(unclaimedLicenses.allIds),
                    A.uniq(eqString),
                )
            },
        }),
        BothState: ({ unclaimedLicenses }) => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: {
                byId: R.fromArray(pipe(
                    payload.unclaimedLicenses,
                    A.map((l) => [l._id, l] as [string, UnclaimedLicense]),
                    A.concat(R.toArray(unclaimedLicenses.byId)),
                )),
                allIds: pipe(
                    payload.unclaimedLicenses,
                    A.map(({ _id }) => _id),
                    A.concat(unclaimedLicenses.allIds),
                    A.uniq(eqString),
                ),
            },
        }),
    }),
});
