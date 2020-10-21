import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import * as O from '@effect-ts/core/Classic/Option';
import { pipe } from '@effect-ts/core/Function';
import { push, RouterAction } from 'connected-react-router';

import * as H from '@curiosity-foundation/feature-http-client';
import { AuthAction, AuthState, getAccessTokenWithSPA } from '@curiosity-foundation/feature-auth';
import {
    ClaimedLicensesAction,
    decodeUnclaimedLicenseList,
    decodeClaimedLicenseList,
    UnclaimedLicensesAction,
} from '@curiosity-foundation/feature-licenses';

import { accessAppConfigM } from './config';
import { AppState, Action } from './store';

export const getTokenAndRedirectAfterLoggingIn =
    (action$: S.UIO<AuthAction>): S.UIO<Action> => pipe(
        action$,
        S.mapConcat((a) => AuthAction.is.LoginSuccess(a)
            ? [
                AuthAction.of.GetAccessToken({}),
            ]
            : []
        ),
    );

export const getAccessTokenAndRedirect =
    (action$: S.UIO<AuthAction>): S.UIO<Action> => pipe(
        getAccessTokenWithSPA(action$),
        S.mapConcat((a) => [a, push('/licenses')]),
    );

export const getLicensesOnEnterLicensesRoute =
    (action$: S.UIO<Action>): S.UIO<Action> => pipe(
        action$,
        S.mapConcat((a) => a.type === '@@router/LOCATION_CHANGE'
            && a.payload.location.pathname === '/licenses'
            ? [
                UnclaimedLicensesAction.of.FetchUnclaimedLicenses({}),
                ClaimedLicensesAction.of.FetchClaimedLicenses({}),
            ]
            : []
        ),
    );

export const fetchUnclaimedLicenses = (action$: S.UIO<Action>, state$: S.UIO<AppState>): S.UIO<Action> =>
    pipe(
        action$,
        S.zipWith(
            state$,
            (a, s) => [a, s] as [UnclaimedLicensesAction, AppState],
        ),
        S.chain(([a, state]) => UnclaimedLicensesAction.is.FetchUnclaimedLicenses(a)
            ? pipe(
                state.auth,
                AuthState.matchStrict<string[]>({
                    LoggedOut: () => [],
                    LoggingIn: () => [],
                    LoggedIn: ({ accessToken }) => [accessToken],
                    LoggingOut: () => [],
                }),
                S.fromArray,
                S.mapM((accessToken) => accessAppConfigM((config) => pipe(
                    H.get(`${config.apiURL}/licenses/unclaimed`),
                    H.withHeaders({ authorization: accessToken }),
                    T.chain((resp) => pipe(
                        resp.body,
                        O.getOrElse(() => ({})),
                        decodeUnclaimedLicenseList,
                    )),
                    T.map((payload) => UnclaimedLicensesAction.of.FetchUnclaimedLicensesSuccess({ payload })),
                    T.catchAll(() => T.succeed(UnclaimedLicensesAction.of.FetchUnclaimedLicensesSuccess({
                        payload: { unclaimedLicenses: [] },
                    }))),
                ))),
                S.merge(S.succeed(UnclaimedLicensesAction.of.FetchUnclaimedLicensesInflight({}))),
            )
            : S.empty,
        ),
    );

export const fetchClaimedLicenses = (action$: S.UIO<Action>, state$: S.UIO<AppState>): S.UIO<Action> =>
    pipe(
        action$,
        S.zipWith(
            state$,
            (a, s) => [a, s] as [ClaimedLicensesAction, AppState],
        ),
        S.chain(([a, state]) => ClaimedLicensesAction.is.FetchClaimedLicenses(a)
            ? pipe(
                state.auth,
                AuthState.matchStrict<string[]>({
                    LoggedOut: () => [],
                    LoggingIn: () => [],
                    LoggedIn: ({ accessToken }) => [accessToken],
                    LoggingOut: () => [],
                }),
                S.fromArray,
                S.mapM((accessToken) => accessAppConfigM((config) => pipe(
                    H.get(`${config.apiURL}/licenses/claimed`),
                    H.withHeaders({ authorization: accessToken }),
                    T.chain((resp) => pipe(
                        resp.body,
                        O.getOrElse(() => ({})),
                        decodeClaimedLicenseList,
                    )),
                    T.map((payload) => ClaimedLicensesAction.of.FetchClaimedLicensesSuccess({ payload })),
                    T.catchAll(() => T.succeed(ClaimedLicensesAction.of.FetchClaimedLicensesSuccess({
                        payload: { claimedLicenses: [] },
                    }))),
                ))),
                S.merge(S.succeed(ClaimedLicensesAction.of.FetchClaimedLicensesInflight({}))),
            )
            : S.empty,
        ),
    );

