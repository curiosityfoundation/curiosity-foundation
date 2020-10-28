import * as O from '@effect-ts/core/Classic/Option'

import { AuthAction } from './action'
import { AuthState } from './state'

const init = AuthState.of.LoggedOut({ error: O.none });

export const authReducer = AuthAction.createReducer(init)({
    StartLogin: () => AuthState.transform({
        LoggedOut: () => AuthState.of.LoggingIn({}),
    }),
    LoginFailure: ({ payload }) => AuthState.transform({
        LoggingIn: () => AuthState.of.LoggedOut({
            error: O.some(payload.message),
        }),
    }),
    LoginSuccess: () => AuthState.transform({
        LoggingIn: () => AuthState.of.LoggedIn({
            working: false,
            user: O.none,
            error: O.none,
            accessToken: O.none,
        }),
    }),
    StartLogout: () => AuthState.transform({
        LoggedIn: ({ accessToken, user }) => AuthState.of.LoggingOut({
            user,
            accessToken,
        }),
    }),
    LogoutFailure: ({ payload }) => AuthState.transform({
        LoggingOut: ({ accessToken, user }) => AuthState.of.LoggedIn({
            working: false,
            user,
            error: O.some(payload.message),
            accessToken,
        }),
    }),
    LogoutSuccess: () => AuthState.transform({
        LoggingOut: () => AuthState.of.LoggedOut({
            error: O.none,
        }),
    }),
    GetAccessToken: () => AuthState.transform({
        LoggedIn: ({ accessToken, user, error }) => AuthState.of.LoggedIn({
            working: true,
            accessToken, 
            user, 
            error,
        })
    }),
    AccessTokenFailure: ({ payload }) => AuthState.transform({
        LoggedIn: ({ accessToken, user }) => AuthState.of.LoggedIn({
            working: false,
            accessToken,
            user,
            error: O.some(payload.message),
        }),
    }),
    AccessTokenSuccess: ({ payload }) => AuthState.transform({
        LoggedIn: ({ user }) => AuthState.of.LoggedIn({
            working: false,
            user,
            error: O.none,
            accessToken: O.some(payload),
        }),
    }),
    GetUser: () => AuthState.transform({
        LoggedIn: ({ accessToken, user, error }) => AuthState.of.LoggedIn({
            working: true,
            accessToken, 
            user, 
            error,
        })
    }),
    UserFailure: ({ payload }) => AuthState.transform({
        LoggedIn: ({ accessToken, user }) => AuthState.of.LoggedIn({
            working: false,
            user,
            error: O.some(payload.message),
            accessToken,
        }),
    }),
    UserSuccess: ({ payload }) => AuthState.transform({
        LoggedIn: ({ accessToken }) => AuthState.of.LoggedIn({
            working: false,
            accessToken,
            user: O.some(payload),
            error: O.none,
        }),
    }),
});
