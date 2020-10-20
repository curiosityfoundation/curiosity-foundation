import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Container, Icon, Menu, Header, Segment, Table, Grid } from 'semantic-ui-react';
import { Formik } from 'formik';

import { AuthAction, AuthState } from '@curiosity-foundation/feature-auth';
import { DeviceId, LicensesAction, UnclaimedLicensesState } from '@curiosity-foundation/feature-licenses';

import { AppState, submitNewLicenseForm } from './store';
import { NewLicenseForm } from './new-license-form';

import 'semantic-ui-css/semantic.min.css';

const renderNavbar = (props: {
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

const renderNewLicenseForm = AuthState.matchStrict({
    LoggedIn: ({ accessToken }) => (
        <Segment>
            <Formik
                onSubmit={submitNewLicenseForm(accessToken)}
                initialValues={DeviceId.build({ deviceId: '' })}
            >
                {NewLicenseForm}
            </Formik>
        </Segment>
    ),
    LoggedOut: () => (<div></div>),
    LoggingIn: () => (<div></div>),
    LoggingOut: () => (<div></div>),
})

const renderUnclaimedLicenses = (props: {
    onFetchUnclaimedLicensesClick: () => void;
}) => UnclaimedLicensesState.match({
    InitState: () => (
        <div>
            <Menu attached>
                <Menu.Item>
                    <Header>Licenses Not Fetched</Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button onClick={props.onFetchUnclaimedLicensesClick}>
                            Load Licenses
                        </Button>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Segment attached>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Device ID</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <Table.Row key={i}>
                                <Table.Cell></Table.Cell>
                                <Table.Cell></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </div>
    ),
    PendingState: () => (
        <div>
            <Menu attached>
                <Menu.Item>
                    <Header>
                        <Icon name='spinner' loading />
                        Loading Licenses
                    </Header>
                </Menu.Item>
            </Menu>
            <Segment attached>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Device ID</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <Table.Row key={i}>
                                <Table.Cell></Table.Cell>
                                <Table.Cell></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </div>
    ),
    LeftState: ({ error, refreshing }) => (
        <div>
            <Menu attached>
                <Menu.Item>
                    <Header>
                        {refreshing
                            ? <Icon name='spinner' loading />
                            : <Icon name='warning' loading />}
                        {error}
                    </Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button
                            disabled={refreshing}
                            onClick={props.onFetchUnclaimedLicensesClick}
                        >
                            Refresh
                    </Button>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Segment attached>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Device ID</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <Table.Row key={i}>
                                <Table.Cell></Table.Cell>
                                <Table.Cell></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </div>
    ),
    RightState: ({ refreshing, unclaimedLicenses }) => (
        <div>
            <Menu attached>
                <Menu.Item>
                    <Header>
                        {refreshing && <Icon name='spinner' loading />}
                        Unclaimed Licenses
                    </Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button
                            disabled={refreshing}
                            onClick={props.onFetchUnclaimedLicensesClick}
                        >
                            Refresh
                        </Button>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Segment attached>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Device ID</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {unclaimedLicenses.map((v, i) => (
                            <Table.Row key={i}>
                                <Table.Cell>{v.deviceId}</Table.Cell>
                                <Table.Cell>{v.created.toDateString()}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </div>
    ),
    BothState: ({ error, refreshing, unclaimedLicenses }) => (
        <div>
            <Menu attached>
                <Menu.Item>
                    <Header>
                        {refreshing
                            ? <Icon name='spinner' loading />
                            : <Icon name='warning' loading />}
                        {error}
                    </Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button
                            disabled={refreshing}
                            onClick={props.onFetchUnclaimedLicensesClick}
                        >
                            Refresh
                    </Button>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Segment attached>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Device ID</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {unclaimedLicenses.map((v, i) => (
                            <Table.Row key={i}>
                                <Table.Cell>{v.deviceId}</Table.Cell>
                                <Table.Cell>{v.created.toDateString()}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </div>
    ),
});

export const App = () => {

    const state = useSelector((x: AppState) => x);
    const dispatch = useDispatch();

    const onLoginClick = () => dispatch(AuthAction.of.StartLogin({}));
    const onLogoutClick = () => dispatch(AuthAction.of.StartLogout({}));
    const onFetchUnclaimedLicensesClick = () => dispatch(LicensesAction.of.FetchUnclaimedLicenses({}));

    return (
        <div>
            {renderNavbar({
                onLoginClick,
                onLogoutClick,
            })(state.auth)}
            <Grid
                columns={2}
                stretched
                style={{
                    marginLeft: '1rem',
                    marginRight: '1rem'
                }}
            >
                <Grid.Column>
                    {renderUnclaimedLicenses({
                        onFetchUnclaimedLicensesClick,
                    })(state.unclaimedLicenses)}
                </Grid.Column>
                <Grid.Column>
                    {renderNewLicenseForm(state.auth)}
                </Grid.Column>
            </Grid>
        </div>
    );

};