import * as T from '@effect-ts/core/Effect'
import * as S from '@effect-ts/core/Effect/Stream'
import * as O from '@effect-ts/core/Classic/Option'
import { pipe, tuple } from '@effect-ts/core/Function'
import { push } from 'connected-react-router'
import { Action as ReduxAction } from 'redux'

import {
  AuthAction,
  AuthState,
} from '@curiosity-foundation/feature-auth'
import {
  ClaimedLicensesAction,
  UnclaimedLicensesAction,
} from '@curiosity-foundation/feature-licenses'

import {
  APIAccessError,
  claimLicense,
  createUnlaimedLicense,
  getClaimedLicenses,
  getUnclaimedLicenses,
} from './api-access'
import { ClaimLicenseFormAction } from './claim-license-form-slice'
import { CreateLicenseFormAction } from './create-license-form-slice'
import { AppState, Action } from './store'

const filterAccessToken = (authState: AuthState) => pipe(
  authState,
  AuthState.matchStrict<string[]>({
    LoggedOut: () => [],
    LoggingIn: () => [],
    LoggedIn: ({ accessToken }) => [accessToken],
    LoggingOut: () => [],
  }),
  S.fromArray,
)

const zipSources = <A, S>(
  action$: S.UIO<A>,
  state$: S.UIO<S>
) =>
  pipe(
    action$,
    S.zipWith(
      state$,
      tuple,
    )
  )

const payload = <P>(p: P) => ({ payload: p })

const matchError = APIAccessError.matchStrict({
  DecodeError: () =>
    pipe(
      {
        name: 'Decoding Error',
        message: 'There was a problem processing the servers response though its likely a license was created',
      },
    ),
  HTTPErrorRequest: () =>
    pipe(
      {
        name: 'Request Error',
        message: 'There was a problem making a request to the server',
      },
    ),
  HTTPErrorResponse: (err) =>
    pipe(
      err.response.body,
      O.fold(
        () => ({
          name: 'Response Error',
          message: 'There was a problem fufilling your request',
        }),
        (body) => ({
          name: 'Response Error',
          message: body,
        }),
      ),
    ),
})

export const getTokenAfterLoggingIn =
  (action$: S.UIO<AuthAction>): S.UIO<Action> =>
    pipe(
      action$,
      S.filter(AuthAction.is.LoginSuccess),
      S.map(() => AuthAction.of.GetAccessToken({})),
    )

export const getLicensesAndRedirectOnAccessTokenSuccess =
  (action$: S.UIO<Action>): S.UIO<Action> =>
    pipe(
      action$,
      S.filter(AuthAction.is.AccessTokenSuccess),
      S.mapConcat(() => [
        push('/licenses'),
        UnclaimedLicensesAction.of.FetchUnclaimedLicenses({}),
        ClaimedLicensesAction.of.FetchClaimedLicenses({}),
      ])
    )

export const fetchUnclaimedLicenses = (
  action$: S.UIO<UnclaimedLicensesAction>,
  state$: S.UIO<AppState>
): S.UIO<Action> =>
  pipe(
    zipSources(action$, state$),
    S.chain(([a, state]) =>
      UnclaimedLicensesAction.is.FetchUnclaimedLicenses(a)
        ? pipe(
          state.auth,
          filterAccessToken,
          S.mapM((accessToken) =>
            pipe(
              getUnclaimedLicenses(accessToken),
              T.map((unclaimedLicenses) =>
                pipe(
                  unclaimedLicenses,
                  payload,
                  UnclaimedLicensesAction.of.FetchUnclaimedLicensesSuccess,
                ),
              ),
              T.catchAll((err) =>
                pipe(
                  err,
                  matchError,
                  payload,
                  UnclaimedLicensesAction.of.FetchUnclaimedLicensesFailure,
                  T.succeed,
                ),
              ),
            ),
          ),
          S.merge(
            S.succeed(
              UnclaimedLicensesAction.of.FetchUnclaimedLicensesInflight({}),
            ),
          ),
        )
        : S.empty,
    ),
  )

export const fetchClaimedLicenses = (
  action$: S.UIO<ClaimedLicensesAction>,
  state$: S.UIO<AppState>
): S.UIO<Action> =>
  pipe(
    zipSources(action$, state$),
    S.chain(([a, state]) =>
      ClaimedLicensesAction.is.FetchClaimedLicenses(a)
        ? pipe(
          filterAccessToken(state.auth),
          S.mapM((accessToken) =>
            pipe(
              getClaimedLicenses(accessToken),
              T.map((unclaimedLicenses) =>
                pipe(
                  unclaimedLicenses,
                  payload,
                  ClaimedLicensesAction.of.FetchClaimedLicensesSuccess,
                ),
              ),
              T.catchAll((err) =>
                pipe(
                  err,
                  matchError,
                  payload,
                  ClaimedLicensesAction.of.FetchClaimedLicensesFailure,
                  T.succeed,
                ),
              ),
            ),
          ),
          S.merge(
            S.succeed(
              ClaimedLicensesAction.of.FetchClaimedLicensesInflight({}),
            ),
          ),
        )
        : S.empty,
    ),
  )

export const claimLicenseForm = (
  action$: S.UIO<ClaimLicenseFormAction>,
  state$: S.UIO<AppState>
): S.UIO<Action> =>
  pipe(
    zipSources(action$, state$),
    S.chain(([a, state]) =>
      ClaimLicenseFormAction.is.ClaimLicenseFormSubmit(a)
        ? pipe(
          filterAccessToken(state.auth),
          S.chain((accessToken) =>
            pipe(
              claimLicense(accessToken, a.payload),
              T.map((claimedLicense) =>
                [
                  pipe(
                    claimedLicense,
                    payload,
                    ClaimLicenseFormAction.of.ClaimLicenseFormSuccess,
                  ),
                  pipe(
                    { claimedLicenses: [claimedLicense] },
                    payload,
                    ClaimedLicensesAction.of.FetchClaimedLicensesSuccess,
                  )
                ]
              ),
              T.catchAll((err) =>
                pipe(
                  err,
                  matchError,
                  payload,
                  ClaimLicenseFormAction.of.ClaimLicenseFormFailure,
                  Array.of,
                  T.succeed,
                ),
              ),
              S.fromEffect,
              S.mapConcat((as) => as),
            ),
          ),
          S.merge(
            S.succeed(
              ClaimLicenseFormAction.of.ClaimLicenseFormInflight({}),
            ),
          ),
        )
        : S.empty,
    ),
  )

export const createLicenseForm = (
  action$: S.UIO<CreateLicenseFormAction>,
  state$: S.UIO<AppState>
): S.UIO<CreateLicenseFormAction | UnclaimedLicensesAction> =>
  pipe(
    zipSources(action$, state$),
    S.chain(([a, state]) =>
      CreateLicenseFormAction.is.CreateLicenseFormSubmit(a)
        ? pipe(
          filterAccessToken(state.auth),
          S.chain((accessToken) =>
            pipe(
              createUnlaimedLicense(accessToken, a.payload),
              T.map((unclaimedLicense) =>
                [
                  pipe(
                    unclaimedLicense,
                    payload,
                    CreateLicenseFormAction.of.CreateLicenseFormSuccess,
                  ),
                  pipe(
                    { unclaimedLicenses: [unclaimedLicense] },
                    payload,
                    UnclaimedLicensesAction.of.FetchUnclaimedLicensesSuccess,
                  )
                ]
              ),
              T.catchAll((err) =>
                pipe(
                  err,
                  matchError,
                  payload,
                  CreateLicenseFormAction.of.CreateLicenseFormFailure,
                  Array.of,
                  T.succeed,
                ),
              ),
              S.fromEffect,
              S.mapConcat((as) => as),
            ),
          ),
          S.merge(
            S.succeed(
              CreateLicenseFormAction.of.CreateLicenseFormInflight({}),
            ),
          ),
        )
        : S.empty,
    ),
  )
