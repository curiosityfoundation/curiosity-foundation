import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import * as Shedule from '@effect-ts/system/Schedule';
import { pipe } from '@effect-ts/core/Function';
import * as A from 'fp-ts/Array';
import * as IO from 'fp-ts/IO';
import * as rpio from 'rpio';

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

const acquireGpio = T.effectTotal(rpio.spiBegin);
const releaseGpio = () => T.effectTotal(rpio.spiEnd);

export const sense = pipe(
    S.bracket(releaseGpio)(acquireGpio),
    S.chain(() => S.fromSchedule(Shedule.fixed(1000))),
    S.chain(() => pipe(
        A.range(0, 7),
        A.map(takeReading),
        A.sequence(IO.io),
        T.effectTotal,
        S.fromEffect,
    )),
);
