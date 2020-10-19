import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Plot from 'react-plotly.js';
import * as A from '@effect-ts/core/Classic/Array';
import { pipe } from '@effect-ts/core/Function';

import { State, DeviceAction } from '@curiosity-foundation/feature-device-io';
import { MessagingAction } from '@curiosity-foundation/feature-messaging';

export const App = () => {

    const state = useSelector((x: State) => x);
    const dispatch = useDispatch();

    const onStartClick = () => dispatch(DeviceAction.of.StartPump({}));

    const onStopClick = () => dispatch(DeviceAction.of.StopPump({}));

    const onListenClick = () => dispatch(MessagingAction.of.StartListening({}));

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
                        // x: pipe(
                        //     state.moistureReadings,
                        //     A.map(({ taken }) => taken),
                        // ),
                        // y: pipe(
                        //     state.moistureReadings,
                        //     A.map(({ value }) => value),
                        // ),
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
                        // x: pipe(
                        //     state.lightReadings,
                        //     A.map(({ taken }) => taken),
                        // ),
                        // y: pipe(
                        //     state.lightReadings,
                        //     A.map(({ value }) => value),
                        // ),
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
