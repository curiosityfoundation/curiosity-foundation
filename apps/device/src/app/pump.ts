import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as rpio from 'rpio';
import { ADTType } from '@morphic-ts/adt';

import { DeviceMessage, DeviceResults } from '@curiosity-foundation/types-messages';

const acquirePump = T.effectTotal(() => {
    rpio.open(4, rpio.OUTPUT, rpio.LOW);
});

const releasePump = () => T.effectTotal(() => {
    rpio.close(4);
});

const startPump = pipe(
    T.effectTotal(() => {
        console.log('startPump');
        rpio.write(4, rpio.HIGH);
    }),
    T.map(() => DeviceResults.of.PumpStarted({}))
);

const stopPump = pipe(
    T.effectTotal(() => {
        console.log('stopPump');
        rpio.write(7, rpio.LOW);
    }),
    T.map(() => DeviceResults.of.PumpStopped({}))
);

const PumpMessage = DeviceMessage.select([
    'StartPump',
    'StopPump',
]);

type PumpMessage = ADTType<typeof PumpMessage>;

export const handlePumpMessage = (msg: PumpMessage) =>
    pipe(
        S.bracket(releasePump)(acquirePump),
        S.chain(() => pipe(
            msg,
            PumpMessage.matchStrict({
                StartPump: () => startPump,
                StopPump: () => stopPump,
            }),
            S.fromEffect,
        )),
    );
