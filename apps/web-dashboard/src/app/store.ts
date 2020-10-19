import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import { configureStore, Store } from '@reduxjs/toolkit';
import * as IO from 'fp-ts/IO';
import Pubnub from 'pubnub';
import * as RC from 'redux-cycles'
import { run as runCycle } from '@cycle/most-run'
import { pipe } from '@effect-ts/core/Function';

import { DeviceAction, DeviceIOState } from '@curiosity-foundation/feature-device-io';
import { cycle as cycle_, embed } from '@curiosity-foundation/adapter-redux-cycles';
import { LoggerLive } from '@curiosity-foundation/feature-logging';
import { MessagingAction, PubnubClientLive } from '@curiosity-foundation/feature-messaging';
import { reducer, ResultAction } from '@curiosity-foundation/feature-device-io';

import { publishDeviceActions, receiveDeviceResults } from './cycles';
import { AppConfigLive } from './config';

export type State = DeviceIOState;
export type Action = MessagingAction | ResultAction | DeviceAction;

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

    const cycle = cycle_<State, Action>();

    const rootCycle = embed(
        cycle(publishDeviceActions),
        cycle(receiveDeviceResults),
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
