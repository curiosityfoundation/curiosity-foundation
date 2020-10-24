import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { LandingPage } from './pages/landing';
import { LicensesPage } from './pages/licenses';

export const App = () => (
    <div>
        <Switch>
            <Route name='home' path='/' exact component={LandingPage} />
            <Route name='licenses' path='/licenses' component={LicensesPage} />
        </Switch>
    </div>
);