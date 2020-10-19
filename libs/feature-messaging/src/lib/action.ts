import * as M from '@effect-ts/morphic';

import { makeAction } from '@curiosity-foundation/util-types';

const StartListening_ = makeAction('StartListening');

export interface StartListening extends M.AType<typeof StartListening_> { }
export interface StartListeningRaw extends M.EType<typeof StartListening_> { }
export const StartListening = M.opaque<StartListeningRaw, StartListening>()(StartListening_);

const StopListening_ = makeAction('StopListening');

export interface StopListening extends M.AType<typeof StopListening_> { }
export interface StopListeningRaw extends M.EType<typeof StopListening_> { }
export const StopListening = M.opaque<StopListeningRaw, StopListening>()(StopListening_);

export const MessagingAction = M.makeADT('type')({
    StartListening,
    StopListening,
});

export type MessagingAction = M.AType<typeof MessagingAction>;
