import * as t from 'io-ts';

export const BlinkMessage = t.type({
    numBlinks: t.number,
});

export type BlinkMessage = t.TypeOf<typeof BlinkMessage>;
