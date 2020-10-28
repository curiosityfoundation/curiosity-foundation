import { tag } from '@effect-ts/core/Has'
import * as T from '@effect-ts/core/Effect'

import { AccessToken, AuthError, User } from './model'

export interface Auth {
  logIn: T.IO<AuthError, void>
  logOut: T.IO<AuthError, void>
  getUser: T.IO<AuthError, User>
  getAccessToken: T.IO<AuthError, AccessToken>
}

export const Auth = tag<Auth>()

export const accessAuth = T.accessService(Auth);
export const accessAuthM = T.accessServiceM(Auth);
