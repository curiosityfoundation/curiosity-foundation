import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import { AuthAction } from '@curiosity-foundation/feature-auth';
import { ClaimedLicensesAction, UnclaimedLicensesAction } from '@curiosity-foundation/feature-licenses';

import { AppState } from './store';
import { renderClaimLicenseForm } from './claim-license-form';
import { renderNewLicenseForm } from './new-license-form';
import { renderNavbar } from './navbar';
import { renderClaimedLicenses } from './claimed-licenses';
import { renderUnclaimedLicenses } from './unclaimed-licenses';

export const LicensesPage = () => {

    const state = useSelector((x: AppState) => x);
    const dispatch = useDispatch();

    const onLoginClick = () => dispatch(AuthAction.of.StartLogin({}));
    const onLogoutClick = () => dispatch(AuthAction.of.StartLogout({}));
    const onFetchUnclaimedLicensesClick = () =>
        dispatch(UnclaimedLicensesAction.of.FetchUnclaimedLicenses({}));
    const onFetchClaimedLicensesClick = () =>
        dispatch(ClaimedLicensesAction.of.FetchClaimedLicenses({}));

    return (
        <div>
            {renderNavbar({
                onLoginClick,
                onLogoutClick,
            })(state.auth)}
            <Grid
                stretched
                verticalAlign='top'
                style={{
                    marginLeft: '1rem',
                    marginRight: '1rem'
                }}
            >
                <Grid.Column width={6}>
                    {renderUnclaimedLicenses({
                        onFetchUnclaimedLicensesClick,
                    })(state.unclaimedLicenses)}
                </Grid.Column>
                <Grid.Column width={6}>
                    {renderClaimedLicenses({
                        onFetchClaimedLicensesClick,
                    })(state.claimedLicenses)}
                </Grid.Column>
                <Grid.Column width={4}>
                    {renderClaimLicenseForm()}
                    <br/>
                    {renderNewLicenseForm(state.auth)}
                </Grid.Column>
            </Grid>
        </div>
    );

};