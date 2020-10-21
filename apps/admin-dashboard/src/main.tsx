import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import { App } from './app/app';
import { createStore, history } from './app/store';

import 'semantic-ui-css/semantic.min.css';

ReactDOM.render(
    <Provider store={createStore()}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);