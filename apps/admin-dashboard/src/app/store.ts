import { Auth0Client } from '@auth0/auth0-spa-js';
import { run as runCycle } from '@cycle/most-run'
import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import { pipe } from '@effect-ts/core/Function';
import { configureStore, Store, combineReducers } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import * as RC from 'redux-cycles'
import fetch from 'isomorphic-fetch'

import { cycle as cycle_, embed } from '@curiosity-foundation/adapter-redux-cycles';
import { info, LoggerLive } from '@curiosity-foundation/feature-logging';
import {
    authReducer,
    AuthState,
    loginWithSPACycle,
    logoutWithSPACycle,
    getAccessTokenWithSPA,
    Auth0ConfigLive,
    Auth0ClientLive,
    AuthAction,
} from '@curiosity-foundation/feature-auth';
import {
    unclaimedLicensesReducer,
    UnclaimedLicensesState,
    LicensesAction,
    DeviceId,
} from '@curiosity-foundation/feature-licenses';
import * as H from '@curiosity-foundation/feature-http-client';
import { FetchClientLive } from '@curiosity-foundation/adapter-fetch';

import { getTokenAndProfileAfterLoggingIn, fetchUnclaimedLicenses } from './cycles';
import { AppConfigLive, accessAppConfigM } from './config';

export type AppState = {
    auth: AuthState;
    unclaimedLicenses: UnclaimedLicensesState;
};

export type Action = AuthAction | LicensesAction;

const provideEnv = pipe(
    L.all(
        LoggerLive({
            info: (message) => console.log('INFO:', message),
            warn: (message) => console.warn('WARN:', message),
            verbose: (message) => console.info('VERBOSE:', message),
        }),
        AppConfigLive({
            apiURL: String(process.env.NX_API_URL),
        }),
        Auth0ClientLive(new Auth0Client({
            domain: String(process.env.NX_AUTH0_DOMAIN),
            client_id: String(process.env.NX_AUTH0_CLIENT_ID),
        })),
        Auth0ConfigLive({
            domain: String(process.env.NX_AUTH0_DOMAIN),
            clientId: String(process.env.NX_AUTH0_CLIENT_ID),
            redirectURI: window.location.origin,
            responseType: 'token id_token',
            scope: 'openid profile write:licenses read:licenses',
            callbackURL: 'http://localhost:4200/callback',
            audience: String(process.env.NX_AUTH0_AUDIENCE),
        }),
        H.HTTPHeadersLive({
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
        }),
        H.HTTPHeadersLive({
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
        }),
        FetchClientLive(fetch),
        H.HTTPMiddlewareStackLive([]),
    ),
    T.provideSomeLayer,
);

export const submitNewLicenseForm = (accessToken: string) =>
    (data: DeviceId) => pipe(
        accessAppConfigM((config) => pipe(
            H.post(`${config.apiURL}/licenses`, data),
            H.withHeaders({
                authorization: accessToken,
            }),
        )),
        T.tap((x) => info(String(x.status))),
        provideEnv,
        T.runPromise,
    );

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

    const cycle = cycle_<AppState, Action>();

    const rootCycle = embed(
        cycle(loginWithSPACycle),
        cycle(logoutWithSPACycle),
        cycle(getAccessTokenWithSPA),
        cycle(getTokenAndProfileAfterLoggingIn),
        cycle(fetchUnclaimedLicenses),
    )(provideEnv);

    const reducer = combineReducers({
        auth: authReducer,
        unclaimedLicenses: unclaimedLicensesReducer,
    });

    const store = configureStore({
        reducer,
        middleware: [cycleMiddleware],
        devTools: true,
    });

    runCycle(rootCycle, {
        ACTION: makeActionDriver(),
        STATE: makeStateDriver(),
    });

    return store;

};
