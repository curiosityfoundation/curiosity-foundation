import React from 'react'
import moment from 'moment'
import { Button, Icon, Menu, Header, Segment, Table, Popup, } from 'semantic-ui-react'

import {
  ClaimedLicenseList,
  ClaimedLicensesState,
} from '@curiosity-foundation/feature-licenses'

const ClaimedLicenseTable: React.FC<ClaimedLicenseList> = (props) => (
  <Table celled compact attached>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Device ID</Table.HeaderCell>
        <Table.HeaderCell>Created</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {props.claimedLicenses.map((v, i) => (
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

export const renderClaimedLicenses = (props: {
  onFetchClaimedLicensesClick: () => void
}) => ClaimedLicensesState.match({
  Init: () => (
    <div>
      <TopMenu
        left={<Header>Licenses Not Fetched</Header>}
        right={(
          <Button onClick={props.onFetchClaimedLicensesClick}>
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
              : <Icon name='warning' />}
            Claimed Licenses
          </Header>
        )}
        right={(
          <Button
            disabled={refreshing}
            onClick={props.onFetchClaimedLicensesClick}
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
            Claimed Licenses
          </Header>
        )}
        right={(
          <Button
            disabled={refreshing}
            onClick={props.onFetchClaimedLicensesClick}
          >
            Refresh
          </Button>
        )}
      />
      <ClaimedLicenseTable claimedLicenses={Object.values(result.byId)} />
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
                  trigger={<Icon name='warning' />}
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
            onClick={props.onFetchClaimedLicensesClick}
          >
            Refresh
          </Button>
        )}
      />
      <ClaimedLicenseTable claimedLicenses={Object.values(result.byId)} />
    </div>
  ),
})
