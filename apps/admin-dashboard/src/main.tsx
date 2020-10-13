import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';

import { App } from './app/app';
import { createStore } from './app/store';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={createStore()}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);