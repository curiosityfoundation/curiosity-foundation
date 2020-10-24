import React from 'react';
import moment from 'moment';
import { Button, Icon, Menu, Header, Segment, Table, Popup, } from 'semantic-ui-react';

import {
  UnclaimedLicenseList,
  UnclaimedLicensesState,
} from '@curiosity-foundation/feature-licenses';

const UnclaimedLicenseTable: React.FC<UnclaimedLicenseList> = (props) => (
  <Table celled compact attached>
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
          <Table.Cell>{moment(v.created).fromNow()}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)

const TopMenu: React.FC<{ left: JSX.Element; right?: JSX.Element; }> =
  (props) => (
    <Menu attached secondary>
      <Menu.Item>
        {props.left}
      </Menu.Item>
      <Menu.Menu position='right'>
        <Menu.Item>
          {props.right || <div></div>}
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  )

export const renderUnclaimedLicenses = (props: {
  onFetchUnclaimedLicensesClick: () => void
}) => UnclaimedLicensesState.match({
  Init: () => (
    <div>
      <TopMenu
        left={<Header>Licenses Not Fetched</Header>}
        right={(
          <Button onClick={props.onFetchUnclaimedLicensesClick}>
            Load Licenses
          </Button>
        )}
      />
      <Segment attached>
        <Header size='small'>None To Show</Header>
      </Segment>
    </div>
  ),
  Pending: () => (
    <div>
      <TopMenu
        left={(
          <Header>
            <Icon name='spinner' loading />
            Loading Licenses
          </Header>
        )}
        right={(
          <Button disabled>
            Refresh
          </Button>
        )}
      />
      <Segment attached>
        <Header size='small'>None To Show</Header>
      </Segment>
    </div>
  ),
  Left: ({ error, refreshing }) => (
    <div>
      <TopMenu
        left={(
          <Header>
            {refreshing
              ? <Icon name='spinner' loading />
              : <Icon name='warning' loading />}
            Unclaimed Licenses
          </Header>
        )}
        right={(
          <Button
            disabled={refreshing}
            onClick={props.onFetchUnclaimedLicensesClick}
          >
            Refresh
          </Button>
        )}
      />
      <Segment attached>
        <Header size='small'>{error.message}</Header>
      </Segment>
    </div>
  ),
  Right: ({ refreshing, result }) => (
    <div>
      <TopMenu
        left={(
          <Header>
            {refreshing && <Icon name='spinner' loading />}
            Unclaimed Licenses
          </Header>
        )}
        right={(
          <Button
            disabled={refreshing}
            onClick={props.onFetchUnclaimedLicensesClick}
          >
            Refresh
          </Button>
        )}
      />
      <UnclaimedLicenseTable unclaimedLicenses={Object.values(result.byId)} />
    </div>
  ),
  Both: ({ error, refreshing, result }) => (
    <div>
      <TopMenu
        left={(
          <Header>
            {refreshing
              ? <Icon name='spinner' loading />
              : !!error
                ? <Popup
                  trigger={<Icon name='warning' loading />}
                  content={error.message}
                  basic
                />
                : <div></div>}
            Claimed Licenses
          </Header>
        )}
        right={(
          <Button
            disabled={refreshing}
            onClick={props.onFetchUnclaimedLicensesClick}
          >
            Refresh
          </Button>
        )}
      />
      <UnclaimedLicenseTable unclaimedLicenses={Object.values(result.byId)} />
    </div>
  ),
})
