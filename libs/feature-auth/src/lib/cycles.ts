import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { cycle } from '@curiosity-foundation/effect-ts-cycle';
import { log } from '@curiosity-foundation/service-logger';

import { AuthAction } from './action';
import { Auth, AuthConfig, AuthConfigURI, AuthURI } from './constants';

export const loginCycle = cycle<any, AuthAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => AuthAction.is.StartLogin(a)
            ? pipe(
                S.access(({ [AuthURI]: auth, [AuthConfigURI]: config }: Auth & AuthConfig) => ({ auth, config })),
                S.mapM(({ auth, config }) => pipe(
                    log('logging in'),
                    T.andThen(T.fromPromise(
                        () => auth.loginWithPopup({
                            redirect_uri: config.redirectURI,
                        }),
                    )),
                    T.chain(() => pipe(
                        log('login succeeded'),
                        T.andThen(pipe(
                            T.fromPromise(() => auth.getUser({})),
                            T.map((user) => AuthAction.of.LoginSuccess({ payload: user }))
                        )),
                    )),
                    T.catchAll(({ message, name }: Error) => pipe(
                        log(`login failed: ${message}`),
                        T.andThen(T.succeed(AuthAction.of.LoginFailure({
                            payload: { message, name },
                        }))),
                    )),
                )),
            )
            : S.fromArray([]),
        ),
    ),
);

export const logoutCycle = cycle<any, AuthAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => AuthAction.is.StartLogout(a)
            ? pipe(
                S.access(({ [AuthURI]: auth }: Auth) => (auth)),
                S.mapM((auth) => pipe(
                    T.effectTotal(() => auth.logout({})),
                    T.map(() => AuthAction.of.LogoutSuccess({})),
                    T.catchAll(({ message, name }: Error) => pipe(
                        log(`logout failed: ${message}`),
                        T.andThen(T.succeed(AuthAction.of.LogoutFailure({
                            payload: { message, name },
                        }))),
                    )),
                )),
            )
            : S.fromArray([]),
        ),
    ),
);
