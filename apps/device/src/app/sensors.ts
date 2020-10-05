import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as IO from 'fp-ts/IO';
import * as rpio from 'rpio';

import { 
    TakeLightReading, 
    TakeMoistureReading, 
    DeviceMessage, 
    DeviceResults,
} from '@curiosity-foundation/types-messages';

const takeReading = (channel: number): IO.IO<number> => () => {

    const txBuffer = Buffer.from([0x01, (8 + channel << 4), 0x01]);
    const rxBuffer = Buffer.alloc(txBuffer.byteLength);

    // Send TX buffer and recieve RX buffer
    rpio.spiTransfer(txBuffer, rxBuffer, txBuffer.length);

    // Extract value from output buffer. Ignore first byte.
    const [_, MSB, LSB] = rxBuffer;

    // Ignore first six bits of MSB, bit shift MSB 8 positions and
    // finally combine LSB and MSB to get a full 10 bit value
    return ((MSB & 3) << 8) + LSB;

};

const acquireSpi = T.effectTotal(rpio.spiBegin);
const releaseSpi = () => T.effectTotal(rpio.spiEnd);

export const SensorConfigURI = 'SensorConfigUri';
export type SensorConfigURI = typeof SensorConfigURI;

export type SensorConfig = {
    [SensorConfigURI]: {
        readInterval: number;
    };
};

export const handleTakeReadingMessage = (msg: TakeLightReading | TakeMoistureReading) =>
    pipe(
        S.bracket(releaseSpi)(acquireSpi),
        S.chain(() => pipe(
            DeviceMessage.is.TakeLightReading(msg) ? 0 : 5,
            takeReading,
            T.effectTotal,
            S.fromEffect,
        )),
        S.map((value) => DeviceMessage.is.TakeLightReading(msg)
            ? DeviceResults.of.LightReading({ value })
            : DeviceResults.of.MoistureReading({ value }),
        ),
    );
