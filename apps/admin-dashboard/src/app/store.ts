import { Auth0Client } from '@auth0/auth0-spa-js';
import { run as runCycle } from '@cycle/most-run'
import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import { pipe } from '@effect-ts/core/Function';
import { configureStore, Store, combineReducers } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import * as RC from 'redux-cycles'
import fetch from 'isomorphic-fetch';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware, RouterAction, RouterState } from 'connected-react-router';

import { cycle as cycle_, embed } from '@curiosity-foundation/adapter-redux-cycles';
import { info, LoggerLive } from '@curiosity-foundation/feature-logging';
import {
    authReducer,
    AuthState,
    loginWithSPACycle,
    logoutWithSPACycle,
    Auth0ConfigLive,
    Auth0ClientLive,
    AuthAction,
} from '@curiosity-foundation/feature-auth';
import {
    claimedLicensesReducer,
    ClaimedLicensesState,
    ClaimedLicensesAction,
    unclaimedLicensesReducer,
    UnclaimedLicensesState,
    UnclaimedLicensesAction,
    DeviceId,
} from '@curiosity-foundation/feature-licenses';
import * as H from '@curiosity-foundation/feature-http-client';
import { FetchClientLive } from '@curiosity-foundation/adapter-fetch';

import {
    getTokenAndRedirectAfterLoggingIn,
    fetchUnclaimedLicenses,
    fetchClaimedLicenses,
    getLicensesOnEnterLicensesRoute,
    getAccessTokenAndRedirect,
    postClaimedLicenses,
} from './cycles';
import { AppConfigLive, accessAppConfigM } from './config';
import {
    ClaimLicenseFormAction,
    ClaimLicenseFormState,
    claimLicenseFormReducer,
} from './claim-license-slice';

export type AppState = {
    auth: AuthState;
    router: RouterState;
    claimedLicenses: ClaimedLicensesState;
    unclaimedLicenses: UnclaimedLicensesState;
    claimLicenseForm: ClaimLicenseFormState;
};

export type Action = AuthAction
    | ClaimedLicensesAction
    | UnclaimedLicensesAction
    | ClaimLicenseFormAction
    | RouterAction;

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
            H.post(`${config.apiURL}/licenses/unclaimed`, data),
            H.withHeaders({
                authorization: accessToken,
            }),
        )),
        provideEnv,
        T.runPromise,
    );

export const submitClaimLicenseForm = (accessToken: string) =>
    (data: DeviceId) => pipe(
        accessAppConfigM((config) => pipe(
            H.post(`${config.apiURL}/licenses/claim`, data),
            H.withHeaders({
                authorization: accessToken,
            }),
        )),
        T.tap((x) => info(String(x.status))),
        provideEnv,
        T.runPromise,
    );

export const history = createBrowserHistory();

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

    const cycle = cycle_<AppState, Action>();

    const rootCycle = embed(
        cycle(loginWithSPACycle),
        cycle(logoutWithSPACycle),
        cycle(getAccessTokenAndRedirect),
        cycle(getTokenAndRedirectAfterLoggingIn),
        cycle(postClaimedLicenses),
        cycle(fetchUnclaimedLicenses),
        cycle(getLicensesOnEnterLicensesRoute),
        cycle(fetchClaimedLicenses),
    )(provideEnv);

    const reducer = combineReducers({
        auth: authReducer,
        router: connectRouter(history),
        claimedLicenses: claimedLicensesReducer,
        unclaimedLicenses: unclaimedLicensesReducer,
        claimLicenseForm: claimLicenseFormReducer,
    });

    const store = configureStore({
        reducer,
        middleware: [
            cycleMiddleware,
            routerMiddleware(history),
        ],
        devTools: true,
    });

    runCycle(rootCycle, {
        ACTION: makeActionDriver(),
        STATE: makeStateDriver(),
    });

    return store;

};
