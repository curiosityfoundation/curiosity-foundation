import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import { configureStore, Store } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import Pubnub from 'pubnub';
import * as RC from 'redux-cycles'
import { run as runCycle } from '@cycle/most-run'
import { pipe } from '@effect-ts/core/Function';

import { embed } from '@curiosity-foundation/effect-ts-cycle';
import { LoggerLive } from '@curiosity-foundation/feature-logging';
import { PubnubClientLive } from '@curiosity-foundation/feature-messaging';
import { reducer } from '@curiosity-foundation/feature-device-io';

import { publishDeviceActions, receiveDeviceResults } from './epics';
import { AppConfigLive } from './config';

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
            PubnubClientLive(new Pubnub({
                publishKey: String(process.env.NX_PUBNUB_PUB_KEY),
                subscribeKey: String(process.env.NX_PUBNUB_SUB_KEY),
                uuid: String(process.env.NX_APP_NAME),
            })),
            AppConfigLive({
                readChannel: String(process.env.NX_READ_CHANNEL),
                writeChannel: String(process.env.NX_WRITE_CHANNEL),
            }),
        ),
        T.provideSomeLayer,
    );

    const rootCycle = embed(
        publishDeviceActions,
        receiveDeviceResults,
    )(provideEnv);

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
