import React from 'react';
import { useDispatch, useStore, useSelector } from 'react-redux';
import Plot from 'react-plotly.js';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import moment from 'moment';
import { Route, Link } from 'react-router-dom';

import { DeviceMessage, LightReading, MoistureReading } from '@curiosity-foundation/types-messages';
import { State } from './data';
import { CommunicationAction } from '@curiosity-foundation/service-communication';

export const App = () => {

    const state = useSelector((x: State) => x);
    const dispatch = useDispatch();

    const onStartClick = () => dispatch(DeviceMessage.of.StartPump({}));

    const onStopClick = () => dispatch(DeviceMessage.of.StopPump({}));
    
    const onListenClick = () => dispatch(CommunicationAction.of.StartListening({}));
    
    return (
        <div>
            <button onClick={onListenClick}>Listen</button>
            <h2>Pump: {state.pumpRunning ? 'ON' : 'OFF'}</h2>
            {state.err && (<p>There was a failure.</p>)}
            <button onClick={onStartClick}>Start Pump</button>
            <button onClick={onStopClick}>Stop Pump</button>
            <h2>Soil Moisture Level</h2>
            <Plot
                data={[
                    {
                        x: pipe(
                            state.moistureReadings,
                            A.map(({ time }) => time),
                        ),
                        y: pipe(
                            state.moistureReadings,
                            A.map(({ value }) => value),
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
            <h2>Light Level</h2>
            <Plot
                data={[
                    {
                        x: pipe(
                            state.lightReadings,
                            A.map(({ time }) => time),
                        ),
                        y: pipe(
                            state.lightReadings,
                            A.map(({ value }) => value),
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
