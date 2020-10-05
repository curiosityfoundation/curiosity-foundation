import React from 'react';
import Plot from 'react-plotly.js';
import Pubnub from 'pubnub';
import { PubNubProvider as PubnubProvider, usePubNub as usePubnub } from 'pubnub-react';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import moment from 'moment';
import { Route, Link } from 'react-router-dom';

import { DeviceMessage, LightReading, MoistureReading } from '@curiosity-foundation/types-messages';

import './app.css';

const DEVICE = 'floral-waterfall';
const MOISTURE_CHANNEL = `${DEVICE}/moisture`;
const LIGHT_CHANNEL = `${DEVICE}/light`;
const PUMP_CHANNEL = `${DEVICE}/pump`;
const MAX_MESSAGES = 200;

type Message = {
    device: string;
    readings: {
        moisture: number;
        light: number;
    };
};

const Dashboard = () => {

    const [mReadings, dispatchMReading] = React.useReducer(
        ([h, ...rest]: [string, MoistureReading][], a: [string, MoistureReading]) =>
            !h ? [a] : rest.length > MAX_MESSAGES
                ? [...rest, a]
                : [h, ...rest, a],
        [],
    );

    const pubnub = usePubnub();

    React.useEffect(() => {
        console.log(mReadings);
    }, [mReadings]);

    React.useEffect(() => {
        pubnub.addListener({
            presence: (presenceEvent) => {
                console.log('presenceEvent', presenceEvent);
            },
            message: ({ timetoken, message }) => {
                pipe(
                    message,
                    MoistureReading.type.decode,
                    E.fold(
                        () => () => { console.log('validation of moisture reading failed') },
                        (reading) => () => dispatchMReading([String(timetoken), reading]),
                    ),
                )();
            },
        });

        pubnub.history({
            channel: MOISTURE_CHANNEL,
            count: MAX_MESSAGES,
        }, (status, response) => {
            console.log('status', status);
            console.log('response', response);
            response.messages
                .forEach(({ entry, timetoken }) => {
                    pipe(
                        entry,
                        MoistureReading.type.decode,
                        E.fold(
                            () => () => { console.log('validation of moisture reading failed') },
                            (reading) => () => dispatchMReading([String(timetoken), reading]),
                        ),
                    )();
                })
        });

        pubnub.subscribe({
            channels: [
                // PUMP_CHANNEL,
                MOISTURE_CHANNEL,
                // LIGHT_CHANNEL,
            ]
        });

    }, []);

    const onStartClick = () => {
        pubnub.publish({
            channel: PUMP_CHANNEL,
            message: DeviceMessage.of.StartPump({}),
        }).then(() => console.log('start'));
    };

    const onStopClick = () => {
        pubnub.publish({
            channel: PUMP_CHANNEL,
            message: DeviceMessage.of.StopPump({}),
        }).then(() => console.log('stop'));
    };

    return (
        <div>
            <h2>Pump</h2>
            <button onClick={onStartClick}>Start Pump</button>
            <button onClick={onStopClick}>Stop Pump</button>
            <h2>Soil Moisture Level</h2>
            <Plot
                data={[
                    {
                        x: pipe(
                            mReadings,
                            A.map(([timetoken]) => new Date(Number(timetoken) / 10000000)),
                        ),
                        y: pipe(
                            mReadings,
                            A.map(([_, reading]) => reading.value),
                        ),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'blue' },
                    },
                ]}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                layout={{
                    yaxis: {
                        range: [0, 1200],
                    },
                    autosize: true,
                }}
            />
            <hr />
            {/* <h2>Light Level</h2>
            <Plot
                data={[
                    {
                        x: pipe(
                            messages,
                            A.map(([timetoken]) => new Date(Number(timetoken) / 10000000)),
                        ),
                        y: pipe(
                            messages,
                            A.map(([_, message]) => message),
                            A.map(({ readings }) => readings.light),
                        ),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'green' },
                    },
                ]}
                style={{ width: '100%', height: '100%' }}
                layout={{
                    yaxis: {
                        range: [0, 1200],
                    },
                    autosize: true,
                }}
            /> */}
        </div>
    )

}

export const App = () => (
    <PubnubProvider client={new Pubnub({
        publishKey: 'pub-c-bf6ce03f-92f7-4a20-862c-56a275282e2c',
        subscribeKey: 'sub-c-da085dbe-f95c-11ea-afa2-4287c4b9a283',
    })}>
        <div className='app'>
            <Dashboard />
        </div>
    </PubnubProvider>
);
