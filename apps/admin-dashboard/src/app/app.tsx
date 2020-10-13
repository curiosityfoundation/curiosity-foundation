import { AuthAction, AuthState } from '@curiosity-foundation/feature-auth';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { State } from './constants';

export const App = () => {

    const state = useSelector((x: State) => x);
    const dispatch = useDispatch();

    const onLoginClick = () => dispatch(AuthAction.of.StartLogin({}));
    const onLogoutClick = () => dispatch(AuthAction.of.StartLogout({}));

    const render = AuthState.match({
        LoggingIn: () => (<div>
            <h1>Logging In</h1>
            <button disabled>Log In</button>
        </div>),
        LoggingOut: () => (<div>
            <h1>Logging Out</h1>
            <button disabled>Log Out</button>
        </div>),
        LoggedIn: ({ error, user }) => (<div>
            <h1>Logged in</h1>
            {!!error && (<p>{error}</p>)}
            {JSON.stringify(user)}
            <button onClick={onLogoutClick}>Log Out</button>
        </div>),
        LoggedOut: ({ error }) => (<div>
            <h1>Logged out</h1>
            {!!error && (<p>{error}</p>)}
            <button onClick={onLoginClick}>Log In</button>
        </div>),
    });

    return render(state.auth);

};