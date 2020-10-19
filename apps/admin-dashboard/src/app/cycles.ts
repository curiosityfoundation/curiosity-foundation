import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import axios from 'axios';

import { cycle } from '@curiosity-foundation/effect-ts-cycle';
import { AuthAction, AuthState } from '@curiosity-foundation/feature-auth';
import { LicensesAction } from '@curiosity-foundation/feature-licenses';

import { accessAppConfigM } from './config';
import { State } from './store';

export const getTokenAndProfileAfterLoggingIn = cycle<any, AuthAction>()(
    (action$) => pipe(
        action$,
        S.mapConcat((a) => AuthAction.is.LoginSuccess(a)
            ? [AuthAction.of.GetAccessToken({})]
            : []
        ),
    ),
);

export const fetchUnclaimedLicenses = cycle<State, LicensesAction>()(
    (action$, state$) => pipe(
        action$,
        S.chain((a) => LicensesAction.is.FetchUnclaimedLicenses(a)
            ? S.fromArray([a])
            : S.empty,
        ),
        S.chain(() => pipe(
            state$,
            S.map(({ auth }) => auth),
            S.mapConcat(AuthState.matchStrict<string[]>({
                LoggedOut: () => [],
                LoggingIn: () => [],
                LoggedIn: ({ accessToken }) => [accessToken],
                LoggingOut: () => [],
            })),
            S.mapM((accessToken) => pipe(
                accessAppConfigM((config) =>
                    T.fromPromise(() => axios.get(
                        `${config.apiURL}/licenses`,
                        {
                            headers: { authorization: accessToken },
                        },
                    ))
                ),
                T.map((x) => LicensesAction.of.FetchUnclaimedLicensesSuccess({ payload: x.data.result })),
                T.catchAll(() => T.succeed(LicensesAction.of.FetchUnclaimedLicensesSuccess({ payload: {} }))),
            )),
        )),
    ),
);
