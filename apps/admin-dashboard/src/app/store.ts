import { Auth0Client } from '@auth0/auth0-spa-js';
import { run as runCycle } from '@cycle/most-run'
import * as T from '@effect-ts/core/Effect'
import { configureStore, Store, combineReducers } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import * as RC from 'redux-cycles'

import { LoggerURI } from '@curiosity-foundation/service-logger';
import { embed } from '@curiosity-foundation/effect-ts-cycle';
import {
    authReducer,
    loginCycle,
    logoutCycle,
    AuthURI,
    AuthConfigURI,
} from '@curiosity-foundation/feature-auth';

import { Env } from './constants';

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

    const withEnv = T.provide<Env>({
        [LoggerURI]: {
            info: console.info,
            warn: console.warn,
            verbose: console.log,
        },
        [AuthURI]: new Auth0Client({
            domain: String(process.env.NX_AUTH0_DOMAIN),
            client_id: String(process.env.NX_AUTH0_CLIENT_ID),
            redirect_uri: window.location.origin,
        }),
        [AuthConfigURI]: {
            domain: String(process.env.NX_AUTH0_DOMAIN),
            clientId: String(process.env.NX_AUTH0_CLIENT_ID),
            redirectURI: window.location.origin,
        },
    });

    const rootCycle = embed(
        logoutCycle,
        loginCycle,
    )(withEnv);

    const reducer = combineReducers({
        auth: authReducer,
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
