import React from 'react';
import Plot from 'react-plotly.js';
import Pubnub from 'pubnub';
import { PubNubProvider as PubnubProvider, usePubNub as usePubnub } from 'pubnub-react';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import moment from 'moment';
import { Route, Link } from 'react-router-dom';

import './app.css';

const channels = ['test'];

type Message = {
    device: string;
    readings: {
        moisture: number;
        light: number;
    };
};

const MAX_MESSAGES = 200;

const Dashboard = () => {

    const [messages, dispatch] = React.useReducer(
        ([h, ...rest]: [string, Message][], a: [string, Message]) =>
            !h ? [a] : rest.length > MAX_MESSAGES
                ? [...rest, a]
                : [h, ...rest, a],
        [],
    );

    const pubnub = usePubnub();

    React.useEffect(() => {
        pubnub.addListener({
            presence: (presenceEvent) => {
                console.log('presenceEvent', presenceEvent);
            },
            message: ({ timetoken, message }) => {
                dispatch([String(timetoken), message]);
            },
        });

        pubnub.history({
            channel: 'test',
            count: MAX_MESSAGES,
        }, (status, response) => response
            .messages
            .forEach(({ entry, timetoken }) =>
                dispatch([String(timetoken), entry])));

        pubnub.subscribe({ channels });

    }, []);


    return (
        <div>
            <h2>Soil Moisture Level</h2>
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
                            A.map(({ readings }) => readings.moisture),
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
            <hr/>
            <h2>Light Level</h2>
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
            />
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
