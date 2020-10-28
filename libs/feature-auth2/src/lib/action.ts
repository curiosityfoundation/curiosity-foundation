import * as M from '@effect-ts/morphic';

import { makeAction, makePayloadAction } from '@curiosity-foundation/util-types';

import { AccessToken, AuthError, User } from './model';

// Log In

const StartLogin_ = makeAction('StartLogin');

export interface StartLogin extends M.AType<typeof StartLogin_> { }
export interface StartLoginRaw extends M.EType<typeof StartLogin_> { }
export const StartLogin = M.opaque<StartLoginRaw, StartLogin>()(StartLogin_);

const LoginSuccess_ = makeAction('LoginSuccess')

export interface LoginSuccess extends M.AType<typeof LoginSuccess_> { }
export interface LoginSuccessRaw extends M.EType<typeof LoginSuccess_> { }
export const LoginSuccess = M.opaque<LoginSuccessRaw, LoginSuccess>()(LoginSuccess_);

const LoginFailure_ = makePayloadAction(
    'LoginFailure',
    M.make((F) => AuthError(F))
);

export interface LoginFailure extends M.AType<typeof LoginFailure_> { }
export interface LoginFailureRaw extends M.EType<typeof LoginFailure_> { }
export const LoginFailure = M.opaque<LoginFailureRaw, LoginFailure>()(LoginFailure_);

// Log Out

const StartLogout_ = makeAction('StartLogout');

export interface StartLogout extends M.AType<typeof StartLogout_> { }
export interface StartLogoutRaw extends M.EType<typeof StartLogout_> { }
export const StartLogout = M.opaque<StartLogoutRaw, StartLogout>()(StartLogout_);

const LogoutSuccess_ = makeAction('LogoutSuccess');

export interface LogoutSuccess extends M.AType<typeof LogoutSuccess_> { }
export interface LogoutSuccessRaw extends M.EType<typeof LogoutSuccess_> { }
export const LogoutSuccess = M.opaque<LogoutSuccessRaw, LogoutSuccess>()(LogoutSuccess_);

const LogoutFailure_ = makePayloadAction(
    'LogoutFailure',
    M.make((F) => AuthError(F)),
);

export interface LogoutFailure extends M.AType<typeof LogoutFailure_> { }
export interface LogoutFailureRaw extends M.EType<typeof LogoutFailure_> { }
export const LogoutFailure = M.opaque<LogoutFailureRaw, LogoutFailure>()(LogoutFailure_);

// Profile

const GetUser_ = makeAction('GetUser');

export interface GetUser extends M.AType<typeof GetUser_> { }
export interface GetUserRaw extends M.EType<typeof GetUser_> { }
export const GetUser = M.opaque<GetUserRaw, GetUser>()(GetUser_);

const UserSuccess_ = makePayloadAction(
    'UserSuccess',
    M.make((F) => User(F)),
)

export interface UserSuccess extends M.AType<typeof UserSuccess_> { }
export interface UserSuccessRaw extends M.EType<typeof UserSuccess_> { }
export const UserSuccess = M.opaque<UserSuccessRaw, UserSuccess>()(UserSuccess_);

const UserFailure_ = makePayloadAction(
    'UserFailure',
    M.make((F) => AuthError(F)),
)

export interface UserFailure extends M.AType<typeof UserFailure_> { }
export interface UserFailureRaw extends M.EType<typeof UserFailure_> { }
export const UserFailure = M.opaque<UserFailureRaw, UserFailure>()(UserFailure_);

// Access Token

const GetAccessToken_ = makeAction('GetAccessToken');

export interface GetAccessToken extends M.AType<typeof GetAccessToken_> { }
export interface GetAccessTokenRaw extends M.EType<typeof GetAccessToken_> { }
export const GetAccessToken = M.opaque<GetAccessTokenRaw, GetAccessToken>()(GetAccessToken_);

const AccessTokenSuccess_ = makePayloadAction(
    'AccessTokenSuccess',
    M.make((F) => AccessToken(F))
);

export interface AccessTokenSuccess extends M.AType<typeof AccessTokenSuccess_> { }
export interface AccessTokenSuccessRaw extends M.EType<typeof AccessTokenSuccess_> { }
export const AccessTokenSuccess = M.opaque<AccessTokenSuccessRaw, AccessTokenSuccess>()(AccessTokenSuccess_);

const AccessTokenFailure_ = makePayloadAction(
    'AccessTokenFailure',
    M.make((F) => AuthError(F)),
);

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
    GetUser,
    UserSuccess,
    UserFailure,
});

export type AuthAction = M.AType<typeof AuthAction>;
