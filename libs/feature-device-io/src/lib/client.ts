import { has } from '@effect-ts/core/Classic/Has'
import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import type * as RPIO from 'rpio';

type RPIO = typeof RPIO;

export interface RPIOClient {
    client: RPIO;
};

export const RPIOClient = has<RPIOClient>();

export const RPIOLive = (rpio: RPIO) =>
    L.fromConstructor(RPIOClient)(() => ({ client: rpio }))();

export const accessRPIO = T.accessService(RPIOClient);
export const accessRPIOM = T.accessServiceM(RPIOClient);
