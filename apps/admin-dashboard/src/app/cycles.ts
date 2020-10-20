import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import * as O from '@effect-ts/core/Classic/Option';
import { pipe } from '@effect-ts/core/Function';

import * as H from '@curiosity-foundation/feature-http-client';
import { AuthAction, AuthState } from '@curiosity-foundation/feature-auth';
import { LicensesAction, decodeUnclaimedLicenseList } from '@curiosity-foundation/feature-licenses';
import { info } from '@curiosity-foundation/feature-logging';

import { accessAppConfigM } from './config';
import { AppState } from './store';

export const getTokenAndProfileAfterLoggingIn =
    (action$: S.UIO<AuthAction>) => pipe(
        action$,
        S.mapConcat((a) => AuthAction.is.LoginSuccess(a)
            ? [AuthAction.of.GetAccessToken({})]
            : []
        ),
    );

export const fetchUnclaimedLicenses =
    (action$: S.UIO<LicensesAction>, state$: S.UIO<AppState>) => pipe(
        action$,
        S.zipWith(
            state$,
            (a, s) => [a, s] as [LicensesAction, AppState],
        ),
        S.chain(([a, state]) => LicensesAction.is.FetchUnclaimedLicenses(a)
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
                    H.get(`${config.apiURL}/licenses`),
                    H.withHeaders({ authorization: accessToken }),
                    T.chain((resp) => pipe(
                        resp.body,
                        O.getOrElse(() => ({})),
                        decodeUnclaimedLicenseList,
                    )),
                    T.map((payload) => LicensesAction.of.FetchUnclaimedLicensesSuccess({ payload })),
                    T.catchAll(() => T.succeed(LicensesAction.of.FetchUnclaimedLicensesSuccess({
                        payload: { unclaimedLicenses: [] },
                    }))),
                ))),
                S.merge(S.succeed(LicensesAction.of.FetchUnclaimedLicensesInflight({}))),
            )
            : S.empty,
        ),
    );
