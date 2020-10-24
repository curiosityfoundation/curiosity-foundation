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
  getAccessTokenWithSPA
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

import { APIAccessLive } from './api-access';
import {
  ClaimLicenseFormAction,
  ClaimLicenseFormState,
  claimLicenseFormReducer,
} from './claim-license-form-slice';
import {
  CreateLicenseFormAction,
  CreateLicenseFormState,
  createLicenseFormReducer,
} from './create-license-form-slice';
import {
  claimLicenseForm,
  createLicenseForm,
  getTokenAfterLoggingIn,
  getLicensesAndRedirectOnAccessTokenSuccess,
  fetchClaimedLicenses,
  fetchUnclaimedLicenses,
  
} from './cycles';

export type AppState = {
  auth: AuthState;
  router: RouterState;
  claimedLicenses: ClaimedLicensesState;
  unclaimedLicenses: UnclaimedLicensesState;
  claimLicenseForm: ClaimLicenseFormState;
  createLicenseForm: CreateLicenseFormState;
};

export type Action = AuthAction
  | ClaimedLicensesAction
  | UnclaimedLicensesAction
  | ClaimLicenseFormAction
  | CreateLicenseFormAction
  | RouterAction;

export const history = createBrowserHistory();

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
      APIAccessLive({
        APIURL: String(process.env.NX_API_URL),
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

  const cycle = cycle_<AppState, Action>();

  const rootCycle = embed(
    cycle(claimLicenseForm),
    cycle(createLicenseForm),
    cycle(getTokenAfterLoggingIn),
    cycle(getLicensesAndRedirectOnAccessTokenSuccess),
    cycle(fetchUnclaimedLicenses),
    cycle(fetchClaimedLicenses),
    cycle(loginWithSPACycle),
    cycle(logoutWithSPACycle),
    cycle(getAccessTokenWithSPA),
  )(provideEnv);

  const reducer = combineReducers({
    auth: authReducer,
    router: connectRouter(history),
    claimedLicenses: claimedLicensesReducer,
    unclaimedLicenses: unclaimedLicensesReducer,
    claimLicenseForm: claimLicenseFormReducer,
    createLicenseForm: createLicenseFormReducer,
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
