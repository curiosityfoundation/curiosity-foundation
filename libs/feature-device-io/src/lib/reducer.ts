import { State, setPumpRunning, appendLightReading, appendMoistureReading, setErrorTrue } from './state';
import { ResultAction } from './action-result';

const init = State.build({
    moistureReadings: [],
    lightReadings: [],
    pumpRunning: false,
    err: false,
});

export const reducer = ResultAction.createReducer(init)({
    PumpStarted: () => setPumpRunning(true),
    PumpStopped: () => setPumpRunning(false),
    ReadingTaken: ({ payload }) =>
        payload.type === 'light'
            ? appendLightReading(payload)
            : appendMoistureReading(payload),
    DeviceFailure: () => setErrorTrue,
});
