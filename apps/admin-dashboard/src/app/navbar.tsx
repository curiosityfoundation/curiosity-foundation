import React from 'react';
import { Icon, Menu, } from 'semantic-ui-react';

import { AuthState } from '@curiosity-foundation/feature-auth';

export const renderNavbar = (props: {
    onLoginClick: () => void;
    onLogoutClick: () => void;
}) => AuthState.match({
    LoggingIn: () => (
        <Menu>
            <Menu.Menu position='right'>
                <Menu.Item>
                    <Icon name='spinner' loading />
                    Logging In...
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    ),
    LoggingOut: () => (
        <Menu>
            <Menu.Menu position='right'>
                <Menu.Item>
                    <Icon name='spinner' loading />
                    Logging Out...
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    ),
    LoggedIn: ({ error, user }) => (
        <Menu>
            <Menu.Menu position='right'>
                <Menu.Item>
                    <Icon name={!!error ? 'warning' : 'user'} />
                    {user.name || user.email}
                </Menu.Item>
                <Menu.Item onClick={props.onLogoutClick}>
                    <Icon name='log out' />
                    Log Out
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    ),
    LoggedOut: ({ error }) => (
        <Menu>
            <Menu.Menu position='right'>
                <Menu.Item>
                    <Icon name={!!error ? 'warning' : 'user'} />
                    Logged Out
                </Menu.Item>
                <Menu.Item onClick={props.onLoginClick}>
                    <Icon name='sign in' />
                    Log In
            </Menu.Item>
            </Menu.Menu>
        </Menu>
    ),
});