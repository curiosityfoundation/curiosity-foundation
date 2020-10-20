import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { FormikProps } from 'formik';
import { DeviceId } from '@curiosity-foundation/feature-licenses';

export const NewLicenseForm: React.FC<FormikProps<DeviceId>> = (props) => (
    <Form>
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
);
