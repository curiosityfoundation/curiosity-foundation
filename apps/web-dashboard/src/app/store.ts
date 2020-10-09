import * as T from '@effect-ts/core/Effect'
import { Action, configureStore, Store } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import Pubnub from 'pubnub';
import * as RC from 'redux-cycles'
import { run as runCycle } from '@cycle/most-run'

import { LoggerURI } from '@curiosity-foundation/service-logger';
import { embed } from '@curiosity-foundation/effect-ts-cycle';
import { DeviceMessage } from '@curiosity-foundation/types-messages';

import { reducer, State } from './data';
import { logPumpStarted, logMoistureReadings } from './epics';

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

    const withEnv = T.provide({});

    const rootCycle = embed(logPumpStarted)(withEnv);

    new Pubnub({
        publishKey: 'pub-c-bf6ce03f-92f7-4a20-862c-56a275282e2c',
        subscribeKey: 'sub-c-da085dbe-f95c-11ea-afa2-4287c4b9a283',
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
