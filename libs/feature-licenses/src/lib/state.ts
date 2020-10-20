import * as M from '@effect-ts/morphic';

import { makeState, makeSimpleState } from '@curiosity-foundation/util-types';

import { UnclaimedLicense } from './model';

const UnclaimedLicenseTable_ = M.make((F) => F.interface({
    unclaimedLicenses: F.interface({
        byId: F.record(UnclaimedLicense(F)),
        allIds: F.array(F.string()),
    }),
}, { name: 'UnclaimedLicenseTable' }));

export interface UnclaimedLicenseTable extends M.AType<typeof UnclaimedLicenseTable_> { }
export interface UnclaimedLicenseTableRaw extends M.EType<typeof UnclaimedLicenseTable_> { }
export const UnclaimedLicenseTable = M.opaque<UnclaimedLicenseTableRaw, UnclaimedLicenseTable>()(UnclaimedLicenseTable_);

const Error_ = M.make((F) => F.interface({
    error: F.string(),
}, { name: 'Error' }));

export interface Error extends M.AType<typeof Error_> { }
export interface ErrorRaw extends M.EType<typeof Error_> { }
export const Error = M.opaque<ErrorRaw, Error>()(Error_);

const Refreshing_ = M.make((F) => F.interface({
    refreshing: F.boolean(),
}, { name: 'Refreshing' }));

export interface Refreshing extends M.AType<typeof Refreshing_> { }
export interface RefreshingRaw extends M.EType<typeof Refreshing_> { }
export const Refreshing = M.opaque<RefreshingRaw, Refreshing>()(Refreshing_);

const InitState_ = makeSimpleState('InitState');

export interface InitState extends M.AType<typeof InitState_> { }
export interface InitStateRaw extends M.EType<typeof InitState_> { }
export const InitState = M.opaque<InitStateRaw, InitState>()(InitState_);

const PendingState_ = makeSimpleState('PendingState');

export interface PendingState extends M.AType<typeof PendingState_> { }
export interface PendingStateRaw extends M.EType<typeof PendingState_> { }
export const PendingState = M.opaque<PendingStateRaw, PendingState>()(PendingState_);

const LeftState_ = makeState(
    'LeftState',
    M.make((F) => F.intersection([
        Error(F),
        Refreshing(F),
    ])),
);

export interface LeftState extends M.AType<typeof LeftState_> { }
export interface LeftStateRaw extends M.EType<typeof LeftState_> { }
export const LeftState = M.opaque<LeftStateRaw, LeftState>()(LeftState_);

const RightState_ = makeState(
    'RightState',
    M.make((F) => F.intersection([
        UnclaimedLicenseTable(F),
        Refreshing(F),
    ])),
);

export interface RightState extends M.AType<typeof RightState_> { }
export interface RightStateRaw extends M.EType<typeof RightState_> { }
export const RightState = M.opaque<RightStateRaw, RightState>()(RightState_);

const BothState_ = makeState(
    'BothState',
    M.make((F) => F.intersection([
        UnclaimedLicenseTable(F),
        Error(F),
        Refreshing(F),
    ])),
);

export interface BothState extends M.AType<typeof BothState_> { }
export interface BothStateRaw extends M.EType<typeof BothState_> { }
export const BothState = M.opaque<BothStateRaw, BothState>()(BothState_);

export const UnclaimedLicensesState = M.makeADT('state')({
    InitState,
    PendingState,
    LeftState,
    RightState,
    BothState,
});

export type UnclaimedLicensesState = M.AType<typeof UnclaimedLicensesState>;
