import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { AuthAction } from '@curiosity-foundation/feature-auth';

import { AppState } from '../store';
import { renderNavbar } from '../navbar';

export const LandingPage = () => {

    const state = useSelector((x: AppState) => x);
    const dispatch = useDispatch();

    const onLoginClick = () => dispatch(AuthAction.of.StartLogin({}));
    const onLogoutClick = () => dispatch(AuthAction.of.StartLogout({}));

    return (
        <div>
            {renderNavbar({
                onLoginClick,
                onLogoutClick,
            })(state.auth)}
            Log In
            <Link to='/licenses'>Licenses</Link>
        </div>
    );

};
