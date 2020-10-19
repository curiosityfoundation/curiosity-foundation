import { Auth0Client } from '@auth0/auth0-spa-js';
import { run as runCycle } from '@cycle/most-run'
import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import { pipe } from '@effect-ts/core/Function';
import { configureStore, Store, combineReducers } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import * as RC from 'redux-cycles'

import { cycle as cycle_, embed } from '@curiosity-foundation/adapter-redux-cycles';
import { LoggerLive } from '@curiosity-foundation/feature-logging';
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
} from '@curiosity-foundation/feature-licenses';

import { getTokenAndProfileAfterLoggingIn, fetchUnclaimedLicenses } from './cycles';
import { AppConfigLive } from './config';

export type State = {
    auth: AuthState;
    unclaimedLicenses: UnclaimedLicensesState;
};

export type Action = AuthAction | LicensesAction;

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

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
        ),
        T.provideSomeLayer,
    );

    const cycle = cycle_<State, Action>();

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
