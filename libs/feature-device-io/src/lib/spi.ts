import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { verbose } from '@curiosity-foundation/feature-logging';

import { accessRPIOM } from './client';

const readChannel = (channel: number) => accessRPIOM(({ client }) =>
    T.effectPartial(
        () => `failed to take spi reading from channel ${channel}`,
    )(() => {

        const txBuffer = Buffer.from([0x01, (8 + channel << 4), 0x01]);
        const rxBuffer = Buffer.alloc(txBuffer.byteLength);

        // Send TX buffer and recieve RX buffer
        client.spiTransfer(txBuffer, rxBuffer, txBuffer.length);

        // Extract value from output buffer. Ignore first byte.
        const [_, MSB, LSB] = rxBuffer;

        // Ignore first six bits of MSB, bit shift MSB 8 positions and
        // finally combine LSB and MSB to get a full 10 bit value
        return ((MSB & 3) << 8) + LSB;

    }),
);

const acquireSPI = pipe(
    verbose(`acquiring spi`),
    T.andThen(accessRPIOM(({ client }) => T.effectPartial(
        () => `failed to acquire spi`,
    )(() => { client.spiBegin(); }))),
);

const releaseSPI = () => pipe(
    verbose(`releasing spi`),
    T.andThen(accessRPIOM(({ client }) =>
        T.effectTotal(() => { client.spiEnd(); }),
    )),
);

export const readSPI = (channel: number) =>
    pipe(
        S.bracket(releaseSPI)(acquireSPI),
        S.chain(() => pipe(
            channel,
            readChannel,
            S.fromEffect,
        )),
    );
