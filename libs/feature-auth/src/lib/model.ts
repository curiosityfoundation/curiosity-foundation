import * as M from '@effect-ts/morphic';
import { decoder } from '@effect-ts/morphic/Decoder';

const User_ = M.make((F) => F.interface({
    name: F.string(),
    email: F.string(),
    email_verified: F.boolean(),
    picture: F.string(),
    updated_at: F.date(),
}, { name: 'User' }));

export interface User extends M.AType<typeof User_> { }
export interface UserRaw extends M.EType<typeof User_> { }
export const User = M.opaque<UserRaw, User>()(User_);

export const decodeUser = decoder(User).decode;

const AccessToken_ = M.make((F) => F.interface({
    accessToken: F.string(),
}, { name: 'AccessToken' }));

export interface AccessToken extends M.AType<typeof AccessToken_> { }
export interface AccessTokenRaw extends M.EType<typeof AccessToken_> { }
export const AccessToken = M.opaque<AccessTokenRaw, AccessToken>()(AccessToken_);

const AuthError_ = M.make((F) => F.interface({
    name: F.string(),
    message: F.string(),
}, { name: 'AuthError' }));

export interface AuthError extends M.AType<typeof AuthError_> { }
export interface AuthErrorRaw extends M.EType<typeof AuthError_> { }
export const AuthError = M.opaque<AuthErrorRaw, AuthError>()(AuthError_);
