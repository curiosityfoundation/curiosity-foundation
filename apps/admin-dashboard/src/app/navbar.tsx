import React from 'react'
import { Icon, Menu, Popup } from 'semantic-ui-react'
import * as O from '@effect-ts/core/Classic/Option'
import { pipe } from '@effect-ts/core/Function'

import { AuthState } from '@curiosity-foundation/feature-auth2'

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
  LoggedIn: ({ working, error, user }) => (
    <Menu>
      <Menu.Menu position='right'>
        <Menu.Item>
          {working
            ? <Icon name='spinner' loading />
            : pipe(
              error,
              O.fold(
                () => <Icon name='user' />,
                (message) => <Popup
                  content={message}
                  trigger={<Icon name='warning' />}
                />,
              )
            )}
          {pipe(
            user,
            O.fold(
              () => 'anonymous',
              ({ name, email }) => name || email,
            )
          )}
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
          {pipe(
            error,
            O.fold(
              () => (<div></div>),
              (message) => <Popup
                content={message}
                trigger={<Icon name='warning' />}
              />,
            )
          )}
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