import * as M from '@effect-ts/morphic';

import { UnclaimedLicense } from './model';

const InitState_ = M.make((F) => F.interface({
    type: F.stringLiteral('InitState'),
}, { name: 'InitState' }));

export interface InitState extends M.AType<typeof InitState_> { }
export interface InitStateRaw extends M.EType<typeof InitState_> { }
export const InitState = M.opaque<InitStateRaw, InitState>()(InitState_);

const PendingState_ = M.make((F) => F.interface({
    type: F.stringLiteral('PendingState'),
}, { name: 'PendingState' }));

export interface PendingState extends M.AType<typeof PendingState_> { }
export interface PendingStateRaw extends M.EType<typeof PendingState_> { }
export const PendingState = M.opaque<PendingStateRaw, PendingState>()(PendingState_);

const LeftState_ = M.make((F) => F.interface({
    type: F.stringLiteral('LeftState'),
    error: F.string(),
    refreshing: F.boolean(),
}, { name: 'LeftState' }));

export interface LeftState extends M.AType<typeof LeftState_> { }
export interface LeftStateRaw extends M.EType<typeof LeftState_> { }
export const LeftState = M.opaque<LeftStateRaw, LeftState>()(LeftState_);

const RightState_ = M.make((F) => F.interface({
    type: F.stringLiteral('RightState'),
    unclaimedLicenses: F.record(UnclaimedLicense(F)),
    refreshing: F.boolean(),
}, { name: 'RightState' }));

export interface RightState extends M.AType<typeof RightState_> { }
export interface RightStateRaw extends M.EType<typeof RightState_> { }
export const RightState = M.opaque<RightStateRaw, RightState>()(RightState_);

const BothState_ = M.make((F) => F.interface({
    type: F.stringLiteral('BothState'),
    error: F.string(),
    unclaimedLicenses: F.record(UnclaimedLicense(F)),
    refreshing: F.boolean(),
}, { name: 'BothState' }));

export interface BothState extends M.AType<typeof BothState_> { }
export interface BothStateRaw extends M.EType<typeof BothState_> { }
export const BothState = M.opaque<BothStateRaw, BothState>()(BothState_);

export const UnclaimedLicensesState = M.makeADT('type')({
    InitState,
    PendingState,
    LeftState,
    RightState,
    BothState,
});

export type UnclaimedLicensesState = M.AType<typeof UnclaimedLicensesState>;
