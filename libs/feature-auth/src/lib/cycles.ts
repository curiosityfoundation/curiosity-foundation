import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { info } from '@curiosity-foundation/feature-logging';

import { AuthAction } from './action';
import { accessAuth0Client } from './client';
import { accessAuth0Config } from './config';
import { decodeUser } from './model';
import { DecodeError } from '@effect-ts/morphic/Decoder/common';

export const loginWithSPACycle =
    (action$: S.UIO<AuthAction>) => pipe(
        action$,
        S.chain((a) => AuthAction.is.StartLogin(a)
            ? pipe(
                accessAuth0Client(({ client }) => client),
                T.chain((client) => pipe(
                    accessAuth0Config((config) => ({
                        config,
                        client,
                    })),
                )),
                S.fromEffect,
                S.mapM(({ client, config }) => pipe(
                    info('logging in'),
                    T.andThen(T.fromPromise(
                        () => client.loginWithPopup({
                            redirect_uri: config.redirectURI,
                            clientID: config.clientId,
                            domain: config.domain,
                            responseType: config.responseType,
                        }),
                    )),
                    T.andThen(pipe(
                        info(`getting profile`),
                        T.andThen(pipe(
                            T.fromPromise(() => client.getUser({})),
                            T.chain(decodeUser),
                            T.map((user) => AuthAction.of.LoginSuccess({
                                payload: user
                            }))
                        )),
                        T.catchAll((err: DecodeError) => pipe(
                            info(`decoding user failed: ${err.errors.length} errors`),
                            T.andThen(T.succeed(AuthAction.of.LoginFailure({
                                payload: {
                                    message: err.errors[0].message,
                                    name: err.errors[0].name,
                                },
                            }))),
                        )),
                    )),
                    T.catchAll(({ message, name }: Error) => pipe(
                        info(`login failed: ${message}`),
                        T.andThen(T.succeed(AuthAction.of.LoginFailure({
                            payload: { message, name },
                        }))),
                    )),
                )),
            )
            : S.fromArray([]),
        ),
    );

export const logoutWithSPACycle =
    (action$: S.UIO<AuthAction>) => pipe(
        action$,
        S.chain((a) => AuthAction.is.StartLogout(a)
            ? pipe(
                accessAuth0Client(({ client }) => client),
                S.fromEffect,
                S.mapM((client) => pipe(
                    T.effectTotal(() => client.logout({})),
                    T.map(() => AuthAction.of.LogoutSuccess({})),
                    T.catchAll(({ message, name }: Error) => pipe(
                        info(`logout failed: ${message}`),
                        T.andThen(T.succeed(AuthAction.of.LogoutFailure({
                            payload: { message, name },
                        }))),
                    )),
                )),
            )
            : S.fromArray([]),
        ),
    );

export const getAccessTokenWithSPA =
    (action$: S.UIO<AuthAction>): S.UIO<AuthAction> => pipe(
        action$,
        S.chain((a) => AuthAction.is.GetAccessToken(a)
            ? pipe(
                accessAuth0Client(({ client }) => client),
                T.chain((client) => pipe(
                    accessAuth0Config((config) => ({
                        config,
                        client,
                    })),
                )),
                S.fromEffect,
                S.mapM(({ client, config }) => pipe(
                    info('getting token'),
                    T.andThen(T.fromPromise(() => client.getTokenSilently({
                        redirect_uri: config.redirectURI,
                        clientID: config.clientId,
                        domain: config.domain,
                        responseType: config.responseType,
                        audience: config.audience,
                        redirectUri: config.callbackURL,
                        scope: config.scope,
                    }))),
                    T.orElse(() => T.fromPromise(() => client.getTokenWithPopup({
                        redirect_uri: config.redirectURI,
                        clientID: config.clientId,
                        domain: config.domain,
                        responseType: config.responseType,
                        audience: config.audience,
                        redirectUri: config.callbackURL,
                        scope: config.scope,
                    }))),
                    T.chain((accessToken) => pipe(
                        info(`token received`),
                        T.andThen(T.succeed(AuthAction.of.AccessTokenSuccess({ payload: { accessToken } }))),
                    )),
                    T.catchAll(({ message, name }: Error) => pipe(
                        info(`login failed: ${message}`),
                        T.andThen(T.succeed(AuthAction.of.AccessTokenFailure({
                            payload: { message, name },
                        }))),
                    )),
                )),
            )
            : S.fromArray([]),
        ),
    );