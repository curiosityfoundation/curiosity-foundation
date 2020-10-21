import React from 'react';
import { Button, Form, Header, Icon, Menu, Segment } from 'semantic-ui-react';
import { Formik, FormikProps } from 'formik';

import { DeviceId } from '@curiosity-foundation/feature-licenses';
import { AuthState } from '@curiosity-foundation/feature-auth';

import { submitNewLicenseForm } from './store';

export const renderNewLicenseForm = AuthState.matchStrict({
    LoggedIn: ({ accessToken }) => (
        <Formik
            onSubmit={submitNewLicenseForm(accessToken)}
            initialValues={DeviceId.build({ deviceId: '' })}
        >
            {NewLicenseForm}
        </Formik>
    ),
    LoggedOut: () => (<div></div>),
    LoggingIn: () => (<div></div>),
    LoggingOut: () => (<div></div>),
});

const NewLicenseForm: React.FC<FormikProps<DeviceId>> = (props) => (
    <div>
        <Menu attached>
            <Menu.Item>
                <Header>
                    {props.isSubmitting
                        ? <Icon name='spinner' loading />
                        : !!props.errors.deviceId && <Icon name='warning' loading />}
                    Create a new License
                </Header>
            </Menu.Item>
        </Menu>
        <Segment attached>
            <Form>
                {!!props.errors.deviceId && (<p>{props.errors.deviceId}</p>)}
                <label>Device Id:</label>
                <Form.Input
                    type='text'
                    name='deviceId'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.deviceId}
                />
                <Button
                    onClick={() => props.handleSubmit()}
                    disabled={!props.dirty}
                    type='submit'
                    content='Create New License'
                />
            </Form>
        </Segment>
    </div>
);
