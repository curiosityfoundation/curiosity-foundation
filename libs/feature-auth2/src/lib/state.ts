import * as M from '@effect-ts/morphic';

import { makeSimpleState, makeState } from '@curiosity-foundation/util-types';

import { User, AccessToken } from './model';

const LoggedIn_ = makeState(
    'LoggedIn',
    M.make((F) => F.interface({
        working: F.boolean(),
        error: F.option(F.string()),
        user: F.option(User(F)),
        accessToken: F.option(AccessToken(F)),
    })),
);

export interface LoggedIn extends M.AType<typeof LoggedIn_> { }
export interface LoggedInRaw extends M.EType<typeof LoggedIn_> { }
export const LoggedIn = M.opaque<LoggedInRaw, LoggedIn>()(LoggedIn_);

const LoggedOut_ = makeState(
    'LoggedOut',
    M.make((F) => F.interface({
        error: F.option(F.string()),
    })),
);

export interface LoggedOut extends M.AType<typeof LoggedOut_> { }
export interface LoggedOutRaw extends M.EType<typeof LoggedOut_> { }
export const LoggedOut = M.opaque<LoggedOutRaw, LoggedOut>()(LoggedOut_);

const LoggingOut_ = makeState(
    'LoggingOut',
    M.make((F) => F.interface({
        user: F.option(User(F)),
        accessToken: F.option(AccessToken(F)),
    })),
);

export interface LoggingOut extends M.AType<typeof LoggingOut_> { }
export interface LoggingOutRaw extends M.EType<typeof LoggingOut_> { }
export const LoggingOut = M.opaque<LoggingOutRaw, LoggingOut>()(LoggingOut_);

const LoggingIn_ = makeSimpleState('LoggingIn'); 

export interface LoggingIn extends M.AType<typeof LoggingIn_> { }
export interface LoggingInRaw extends M.EType<typeof LoggingIn_> { }
export const LoggingIn = M.opaque<LoggingInRaw, LoggingIn>()(LoggingIn_);

export const AuthState = M.makeADT('state')({
    LoggedIn,
    LoggedOut,
    LoggingOut,
    LoggingIn,
});

export type AuthState = M.AType<typeof AuthState>;
