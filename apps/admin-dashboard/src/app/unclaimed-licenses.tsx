import React from 'react';
import { Button, Icon, Menu, Header, Segment, Table,  } from 'semantic-ui-react';

import { 
    UnclaimedLicenseList,
    UnclaimedLicensesState, 
} from '@curiosity-foundation/feature-licenses';

import { renderNavbar } from './navbar';

const UnclaimedLicenseTable: React.FC<UnclaimedLicenseList> = (props) => (
    <Table celled>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Device ID</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {props.unclaimedLicenses.map((v, i) => (
                <Table.Row key={i}>
                    <Table.Cell>{v.deviceId}</Table.Cell>
                    <Table.Cell>{v.created.toDateString()}</Table.Cell>
                </Table.Row>
            ))}
        </Table.Body>
    </Table>
);

export const renderUnclaimedLicenses = (props: {
    onFetchUnclaimedLicensesClick: () => void;
}) => UnclaimedLicensesState.match({
    Init: () => (
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
                <Header size='small'>None To Show</Header>
            </Segment>
        </div>
    ),
    Pending: () => (
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
                <Header size='small'>None To Show</Header>
            </Segment>
        </div>
    ),
    Left: ({ error, refreshing }) => (
        <div>
            <Menu attached>
                <Menu.Item>
                    <Header>
                        {refreshing
                            ? <Icon name='spinner' loading />
                            : <Icon name='warning' loading />}
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
                <Header size='small'>{error}</Header>
            </Segment>
        </div>
    ),
    Right: ({ refreshing, result }) => (
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
                <UnclaimedLicenseTable unclaimedLicenses={Object.values(result.byId)} />
            </Segment>
        </div>
    ),
    Both: ({ error, refreshing, result }) => (
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
                <UnclaimedLicenseTable unclaimedLicenses={Object.values(result.byId)} />
            </Segment>
        </div>
    ),
});
