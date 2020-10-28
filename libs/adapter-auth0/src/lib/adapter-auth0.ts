import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer'
import { pipe } from '@effect-ts/core/Function';
import * as auth0 from '@auth0/auth0-spa-js';

import { Auth, AuthError, decodeUser, AccessToken } from '@curiosity-foundation/feature-auth2';

export interface Auth0Config {
  client: auth0.Auth0Client
  loginOpts: auth0.PopupLoginOptions
  logoutOpts: auth0.LogoutOptions
  tokenOpts: auth0.GetTokenWithPopupOptions
}

export const Auth0ClientLive = ({
  client,
  loginOpts,
  logoutOpts,
  tokenOpts,
}: Auth0Config) => L.pure(Auth)({
  logIn: T.fromPromiseWith(
    () => AuthError.build({
      name: 'LogInError',
      message: 'failed to log in',
    })
  )(() =>
    client.loginWithPopup(loginOpts)
  ),
  logOut: T.effectPartial(
    () => AuthError.build({
      name: 'LogOutError',
      message: 'failed to log out',
    })
  )(() =>
    client.logout(logoutOpts)
  ),
  getUser: pipe(
    T.fromPromiseWith(
      () => AuthError.build({
        name: 'LogOutError',
        message: 'failed to get user',
      })
    )(() =>
      client.getUser({})
    ),
    T.chain((data) =>
      pipe(
        data,
        decodeUser,
        T.mapError(() =>
          AuthError.build({
            name: 'GetUserError',
            message: 'failed to decode user',
          })
        )
      )
    )
  ),
  getAccessToken: pipe(
    T.fromPromiseWith(
      () => AuthError.build({
        name: 'LogOutError',
        message: 'failed to token silently',
      })
    )(() =>
      client.getTokenSilently(tokenOpts)
    ),
    T.orElse(() =>
      T.fromPromiseWith(
        () => AuthError.build({
          name: 'LogOutError',
          message: 'failed to token with popup',
        })
      )(() =>
        client.getTokenWithPopup(tokenOpts)
      ),
    ),
    T.map((accessToken: string) =>
      AccessToken.build({
        token: accessToken,
        valid: new Date(),
      })
    ),
    T.mapError(() =>
      AuthError.build({
        name: 'GetAccessTokenError',
        message: 'failed to get access token',
      })
    )
  )
})
