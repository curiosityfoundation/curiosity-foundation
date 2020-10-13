import { AuthAction } from './action';
import { AuthState } from './state';

const init = AuthState.of.LoggedOut({ error: null });

export const authReducer = AuthAction.createReducer(init)({
    StartLogin: () => AuthState.transform({
        LoggedOut: () => AuthState.of.LoggingIn({}),
    }),
    LoginFailure: () => AuthState.transform({
        LoggingIn: () => AuthState.of.LoggedOut({ error: 'error logging in' }),
    }),
    LoginSuccess: ({ payload }) => AuthState.transform({
        LoggingIn: () => AuthState.of.LoggedIn({ user: payload, error: null }),
    }),
    StartLogout: () => AuthState.transform({
        LoggedIn: ({ user }) => AuthState.of.LoggingOut({ user }),
    }),
    LogoutFailure: () => AuthState.transform({
        LoggingOut: ({ user }) => AuthState.of.LoggedIn({ user, error: 'error logging out' }),
    }),
    LogoutSuccess: () => AuthState.transform({
        LoggingOut: () => AuthState.of.LoggedOut({ error: null }),
    }),
});
