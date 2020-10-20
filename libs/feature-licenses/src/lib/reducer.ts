import { LicensesAction } from './action';
import { UnclaimedLicensesState } from './state';

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
    }),
    FetchUnclaimedLicensesSuccess: ({ payload }) => UnclaimedLicensesState.transform({
        PendingState: () => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: payload.unclaimedLicenses,
        }),
        LeftState: () => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: payload.unclaimedLicenses,
        }),
        RightState: () => UnclaimedLicensesState.of.RightState({
            refreshing: false,
            unclaimedLicenses: payload.unclaimedLicenses,
        }),
    }),
});
