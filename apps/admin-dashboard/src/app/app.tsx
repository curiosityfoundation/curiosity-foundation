import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { LicensesPage } from './licenses-page';
import { LandingPage } from './landing-page';

export const App = () => (
    <div>
        <Switch>
            <Route name='home' path='/' exact component={LandingPage} />
            <Route name='licenses' path='/licenses' component={LicensesPage} />
        </Switch>
    </div>
);