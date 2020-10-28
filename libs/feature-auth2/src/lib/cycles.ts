import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Stream'
import { pipe } from '@effect-ts/core/Function'

import { AuthAction } from './action'
import { accessAuth } from './auth'
import { AuthError } from './model'

const loginCycle = (
  action$: S.UIO<AuthAction>
): S.UIO<AuthAction> =>
  pipe(
    action$,
    S.filter(AuthAction.is.StartLogin),
    S.mapM(() =>
      pipe(
        accessAuth((auth) => auth),
        T.chain((auth) =>
          pipe(
            auth.logIn,
            T.map(() =>
              AuthAction.of.LoginSuccess({})
            ),
            T.catchAll(({ message }: AuthError) =>
              T.succeed(
                AuthAction.of.LoginFailure({
                  payload: {
                    message,
                    name: 'AuthError'
                  },
                })
              )
            )
          )
        )
      )
    )
  )

const logoutCycle = (
  action$: S.UIO<AuthAction>
): S.UIO<AuthAction> =>
  pipe(
    action$,
    S.filter(AuthAction.is.StartLogout),
    S.mapM(() =>
      pipe(
        accessAuth((auth) => auth),
        T.chain((auth) =>
          pipe(
            auth.logOut,
            T.map(() =>
              AuthAction.of.LogoutSuccess({})
            ),
            T.catchAll(({ message }: AuthError) =>
              T.succeed(
                AuthAction.of.LogoutFailure({
                  payload: {
                    message,
                    name: 'AuthError'
                  },
                })
              )
            )
          )
        )
      )
    )
  )

const getAccessTokenCycle = (
  action$: S.UIO<AuthAction>
): S.UIO<AuthAction> =>
  pipe(
    action$,
    S.filter(AuthAction.is.GetAccessToken),
    S.mapM(() =>
      pipe(
        accessAuth((auth) => auth),
        T.chain((auth) =>
          pipe(
            auth.getAccessToken,
            T.map((accessToken) =>
              AuthAction.of.AccessTokenSuccess({
                payload: accessToken
              })
            ),
            T.catchAll(({ message }: AuthError) =>
              T.succeed(
                AuthAction.of.AccessTokenFailure({
                  payload: {
                    message,
                    name: 'AuthError'
                  },
                })
              )
            )
          )
        )
      )
    )
  )

const getUserCycle = (
  action$: S.UIO<AuthAction>
): S.UIO<AuthAction> =>
  pipe(
    action$,
    S.filter(AuthAction.is.GetUser),
    S.mapM(() =>
      pipe(
        accessAuth((auth) => auth),
        T.chain((auth) =>
          pipe(
            auth.getUser,
            T.map((user) =>
              AuthAction.of.UserSuccess({
                payload: user
              })
            ),
            T.catchAll(({ message }: AuthError) =>
              T.succeed(
                AuthAction.of.UserFailure({
                  payload: {
                    message,
                    name: 'AuthError'
                  },
                })
              )
            )
          )
        )
      )
    )
  )

export const AuthCycles = {
  loginCycle,
  logoutCycle,
  getAccessTokenCycle,
  getUserCycle,
}
