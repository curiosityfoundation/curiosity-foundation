import * as M from '@effect-ts/morphic';
import { User } from './user';

const LoggedIn_ = M.make((F) => F.interface({
    type: F.stringLiteral('LoggedIn'),
    error: F.optional(F.string()),
    user: User(F),
}, { name: 'LoggedIn' }));

export interface LoggedIn extends M.AType<typeof LoggedIn_> { }
export interface LoggedInRaw extends M.EType<typeof LoggedIn_> { }
export const LoggedIn = M.opaque<LoggedInRaw, LoggedIn>()(LoggedIn_);

const LoggedOut_ = M.make((F) => F.interface({
    type: F.stringLiteral('LoggedOut'),
    error: F.optional(F.string()),
}, { name: 'LoggedOut' }));

export interface LoggedOut extends M.AType<typeof LoggedOut_> { }
export interface LoggedOutRaw extends M.EType<typeof LoggedOut_> { }
export const LoggedOut = M.opaque<LoggedOutRaw, LoggedOut>()(LoggedOut_);

const LoggingOut_ = M.make((F) => F.interface({
    type: F.stringLiteral('LoggingOut'),
    user: User(F),
}, { name: 'LoggingOut' }));

export interface LoggingOut extends M.AType<typeof LoggingOut_> { }
export interface LoggingOutRaw extends M.EType<typeof LoggingOut_> { }
export const LoggingOut = M.opaque<LoggingOutRaw, LoggingOut>()(LoggingOut_);

const LoggingIn_ = M.make((F) => F.interface({
    type: F.stringLiteral('LoggingIn'),
}, { name: 'LoggingIn' }));

export interface LoggingIn extends M.AType<typeof LoggingIn_> { }
export interface LoggingInRaw extends M.EType<typeof LoggingIn_> { }
export const LoggingIn = M.opaque<LoggingInRaw, LoggingIn>()(LoggingIn_);

export const AuthState = M.makeADT('type')({
    LoggedIn,
    LoggedOut,
    LoggingIn,
    LoggingOut,
});

export type AuthState = M.AType<typeof AuthState>;
