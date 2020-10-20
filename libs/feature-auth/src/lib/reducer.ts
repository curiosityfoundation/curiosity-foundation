import { AuthAction } from './action';
import { AuthState } from './state';

const init = AuthState.of.LoggedOut({ error: null });

export const authReducer = AuthAction.createReducer(init)({
    StartLogin: () => AuthState.transform({
        LoggedOut: () => AuthState.of.LoggingIn({}),
    }),
    LoginFailure: ({ payload }) => AuthState.transform({
        LoggingIn: () => AuthState.of.LoggedOut({
            error: payload.message,
        }),
    }),
    LoginSuccess: ({ payload }) => AuthState.transform({
        LoggingIn: () => AuthState.of.LoggedIn({
            user: payload,
            error: null,
            accessToken: null,
        }),
    }),
    StartLogout: () => AuthState.transform({
        LoggedIn: ({ accessToken, user }) => AuthState.of.LoggingOut({
            user,
            accessToken
        }),
    }),
    LogoutFailure: ({ payload }) => AuthState.transform({
        LoggingOut: ({ accessToken, user }) => AuthState.of.LoggedIn({
            user,
            error: payload.message,
            accessToken,
        }),
    }),
    LogoutSuccess: () => AuthState.transform({
        LoggingOut: () => AuthState.of.LoggedOut({
            error: null,
        }),
    }),
    GetAccessToken: () => (s) => s,
    AccessTokenFailure: ({ payload }) => AuthState.transform({
        LoggedIn: ({ accessToken, user }) => AuthState.of.LoggedIn({
            accessToken,
            user,
            error: payload.message,
        }),
    }),
    AccessTokenSuccess: ({ payload }) => AuthState.transform({
        LoggedIn: ({ user, error }) => AuthState.of.LoggedIn({
            user,
            error,
            accessToken: payload.accessToken,
        }),
    }),
});
