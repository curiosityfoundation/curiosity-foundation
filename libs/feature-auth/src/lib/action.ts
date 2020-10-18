import * as M from '@effect-ts/morphic';
import { User } from './user';

// Log In

const StartLogin_ = M.make((F) => F.interface({
    type: F.stringLiteral('StartLogin'),
}, { name: 'StartLogin' }));

export interface StartLogin extends M.AType<typeof StartLogin_> { }
export interface StartLoginRaw extends M.EType<typeof StartLogin_> { }
export const StartLogin = M.opaque<StartLoginRaw, StartLogin>()(StartLogin_);

const LoginSuccess_ = M.make((F) => F.interface({
    type: F.stringLiteral('LoginSuccess'),
    payload: User(F),
}, { name: 'LoginSuccess' }));

export interface LoginSuccess extends M.AType<typeof LoginSuccess_> { }
export interface LoginSuccessRaw extends M.EType<typeof LoginSuccess_> { }
export const LoginSuccess = M.opaque<LoginSuccessRaw, LoginSuccess>()(LoginSuccess_);

const LoginFailure_ = M.make((F) => F.interface({
    type: F.stringLiteral('LoginFailure'),
    payload: F.interface({
        name: F.string(),
        message: F.string(),
    }),
}, { name: 'LoginFailure' }));

export interface LoginFailure extends M.AType<typeof LoginFailure_> { }
export interface LoginFailureRaw extends M.EType<typeof LoginFailure_> { }
export const LoginFailure = M.opaque<LoginFailureRaw, LoginFailure>()(LoginFailure_);

// Log Out

const StartLogout_ = M.make((F) => F.interface({
    type: F.stringLiteral('StartLogout'),
}, { name: 'StartLogout' }));

export interface StartLogout extends M.AType<typeof StartLogout_> { }
export interface StartLogoutRaw extends M.EType<typeof StartLogout_> { }
export const StartLogout = M.opaque<StartLogoutRaw, StartLogout>()(StartLogout_);

const LogoutSuccess_ = M.make((F) => F.interface({
    type: F.stringLiteral('LogoutSuccess'),
}, { name: 'LogoutSuccess' }));

export interface LogoutSuccess extends M.AType<typeof LogoutSuccess_> { }
export interface LogoutSuccessRaw extends M.EType<typeof LogoutSuccess_> { }
export const LogoutSuccess = M.opaque<LogoutSuccessRaw, LogoutSuccess>()(LogoutSuccess_);

const LogoutFailure_ = M.make((F) => F.interface({
    type: F.stringLiteral('LogoutFailure'),
    payload: F.interface({
        name: F.string(),
        message: F.string(),
    }),
}, { name: 'LogoutFailure' }));

export interface LogoutFailure extends M.AType<typeof LogoutFailure_> { }
export interface LogoutFailureRaw extends M.EType<typeof LogoutFailure_> { }
export const LogoutFailure = M.opaque<LogoutFailureRaw, LogoutFailure>()(LogoutFailure_);

// Access Token

const GetAccessToken_ = M.make((F) => F.interface({
    type: F.stringLiteral('GetAccessToken'),
}, { name: 'GetAccessToken' }));

export interface GetAccessToken extends M.AType<typeof GetAccessToken_> { }
export interface GetAccessTokenRaw extends M.EType<typeof GetAccessToken_> { }
export const GetAccessToken = M.opaque<GetAccessTokenRaw, GetAccessToken>()(GetAccessToken_);

const AccessTokenSuccess_ = M.make((F) => F.interface({
    type: F.stringLiteral('AccessTokenSuccess'),
    payload: F.string(),
}, { name: 'AccessTokenSuccess' }));

export interface AccessTokenSuccess extends M.AType<typeof AccessTokenSuccess_> { }
export interface AccessTokenSuccessRaw extends M.EType<typeof AccessTokenSuccess_> { }
export const AccessTokenSuccess = M.opaque<AccessTokenSuccessRaw, AccessTokenSuccess>()(AccessTokenSuccess_);

const AccessTokenFailure_ = M.make((F) => F.interface({
    type: F.stringLiteral('AccessTokenFailure'),
    payload: F.interface({
        name: F.string(),
        message: F.string(),
    }),
}, { name: 'AccessTokenFailure' }));

export interface AccessTokenFailure extends M.AType<typeof AccessTokenFailure_> { }
export interface AccessTokenFailureRaw extends M.EType<typeof AccessTokenFailure_> { }
export const AccessTokenFailure = M.opaque<AccessTokenFailureRaw, AccessTokenFailure>()(AccessTokenFailure_);

export const AuthAction = M.makeADT('type')({
    StartLogin,
    LoginFailure,
    LoginSuccess,
    StartLogout,
    LogoutFailure,
    LogoutSuccess,
    GetAccessToken,
    AccessTokenSuccess,
    AccessTokenFailure,
});

export type AuthAction = M.AType<typeof AuthAction>;