import { Auth0Client } from '@auth0/auth0-spa-js';
import { run as runCycle } from '@cycle/most-run'
import * as T from '@effect-ts/core/Effect'
import { configureStore, Store, combineReducers } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import * as RC from 'redux-cycles'

import { LoggerLive } from '@curiosity-foundation/feature-logging';
import { embed } from '@curiosity-foundation/effect-ts-cycle';
import {
    authReducer,
    loginWithSPACycle,
    logoutWithSPACycle,
    getAccessTokenWithSPA,
    SPAAuthURI,
    AuthConfigURI,
} from '@curiosity-foundation/feature-auth';
import {
    unclaimedLicensesReducer,
} from '@curiosity-foundation/feature-licenses';

import { getTokenAndProfileAfterLoggingIn, fetchUnclaimedLicenses } from './cycles';
import { AppConfigURI, Env } from './constants';

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

    const withEnv = T.provide<Env>({
        [LoggerURI]: {
            info: console.info,
            warn: console.warn,
            verbose: console.log,
        },
        [SPAAuthURI]: new Auth0Client({
            domain: String(process.env.NX_AUTH0_DOMAIN),
            client_id: String(process.env.NX_AUTH0_CLIENT_ID),
        }),
        [AuthConfigURI]: {
            domain: String(process.env.NX_AUTH0_DOMAIN),
            clientId: String(process.env.NX_AUTH0_CLIENT_ID),
            redirectURI: window.location.origin,
            responseType: 'token id_token',
            scope: 'openid profile write:licenses read:licenses',
            callbackURL: 'http://localhost:4200/callback',
            audience: String(process.env.NX_AUTH0_AUDIENCE),
        },
        [AppConfigURI]: {
            apiURL: 'http://localhost:8080',
        }
    });
    
    const rootCycle = embed(
        loginWithSPACycle,
        logoutWithSPACycle,
        getAccessTokenWithSPA,
        getTokenAndProfileAfterLoggingIn,
        fetchUnclaimedLicenses,
    )(withEnv);

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
