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
import { publishDeviceActions, receiveDeviceResults } from './epics';
import { CommunicationURI } from '@curiosity-foundation/service-communication';
import { AppConfigURI, Env } from './constants';

export const createStore: IO.IO<Store> = () => {

    const cycleMiddleware = RC.createCycleMiddleware();
    const { makeActionDriver, makeStateDriver } = cycleMiddleware;

    const withEnv = T.provide<Env>({
        [CommunicationURI]: new Pubnub({
            publishKey: String(process.env.NX_PUBNUB_PUB_KEY),
            subscribeKey: String(process.env.NX_PUBNUB_SUB_KEY),
            uuid: String(process.env.NX_APP_NAME),
        }),
        [AppConfigURI]: {
            readChannel: String(process.env.NX_READ_CHANNEL),
            writeChannel: String(process.env.NX_WRITE_CHANNEL),
        },
        [LoggerURI]: {
            info: console.info,
            warn: console.warn,
            verbose: console.log,
        },
    });

    const rootCycle = embed(
        publishDeviceActions,
        receiveDeviceResults,
    )(withEnv);

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
