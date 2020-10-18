import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { cycle } from '@curiosity-foundation/effect-ts-cycle';
import { log } from '@curiosity-foundation/service-logger';

import { AuthAction } from './action';
import {
    AuthConfig,
    AuthConfigURI,
    SPAAuth,
    SPAAuthURI,
} from './constants';

export const loginWithSPACycle = cycle<any, AuthAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => AuthAction.is.StartLogin(a)
            ? pipe(
                S.access(({
                    [SPAAuthURI]: auth,
                    [AuthConfigURI]: config
                }: SPAAuth & AuthConfig) => ({ auth, config })),
                S.mapM(({ auth, config }) => pipe(
                    log('logging in'),
                    T.andThen(T.fromPromise(
                        () => auth.loginWithPopup({
                            redirect_uri: config.redirectURI,
                            clientID: config.clientId,
                            domain: config.domain,
                            responseType: config.responseType,
                        }),
                    )),
                    T.andThen(pipe(
                        log(`getting profile`),
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

export const logoutWithSPACycle = cycle<any, AuthAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => AuthAction.is.StartLogout(a)
            ? pipe(
                S.access(({ [SPAAuthURI]: auth }: SPAAuth) => (auth)),
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

export const getAccessTokenWithSPA = cycle<any, AuthAction>()(
    (action$) => pipe(
        action$,
        S.chain((a) => AuthAction.is.GetAccessToken(a)
            ? pipe(
                S.access(({
                    [SPAAuthURI]: auth,
                    [AuthConfigURI]: config
                }: SPAAuth & AuthConfig) => ({ auth, config })),
                S.mapM(({ auth, config }) => pipe(
                    log('getting token'),
                    T.andThen(T.fromPromise(() => auth.getTokenSilently({
                        redirect_uri: config.redirectURI,
                        clientID: config.clientId,
                        domain: config.domain,
                        responseType: config.responseType,
                        audience: config.audience,
                        redirectUri: config.callbackURL,
                        scope: config.scope,
                    }))),
                    T.orElse(() => T.fromPromise(() => auth.getTokenWithPopup({
                        redirect_uri: config.redirectURI,
                        clientID: config.clientId,
                        domain: config.domain,
                        responseType: config.responseType,
                        audience: config.audience,
                        redirectUri: config.callbackURL,
                        scope: config.scope,
                    }))),
                    T.chain((token) => pipe(
                        log(`token received`),
                        T.andThen(T.succeed(AuthAction.of.AccessTokenSuccess({ payload: token }))),
                    )),
                    T.catchAll(({ message, name }: Error) => pipe(
                        log(`login failed: ${message}`),
                        T.andThen(T.succeed(AuthAction.of.AccessTokenFailure({
                            payload: { message, name },
                        }))),
                    )),
                )),
            )
            : S.fromArray([]),
        ),
    ),
);