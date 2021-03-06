import * as O from '@effect-ts/core/Classic/Option';
import { pipe } from '@effect-ts/core/Function';
import React from 'react';
import { Button, Form, Header, Icon, Menu, Segment } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { DeviceId } from '@curiosity-foundation/feature-licenses';
import {
    ClaimLicenseFormState,
    ClaimLicenseFormAction,
    foldStateToFormProps,
} from './claim-license-form-slice';

import { AppState } from './store';

const schema = yup.object<DeviceId>().shape({
    deviceId: yup.string().min(8).max(32).required(),
});

export const renderClaimLicenseForm = () => {

    const formState = useSelector((s: AppState) => s.claimLicenseForm);
    const { error, result } = foldStateToFormProps(formState);
    const dispatch = useDispatch();
    const { control, errors, handleSubmit } = useForm<DeviceId, {}>({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data: DeviceId) => dispatch(ClaimLicenseFormAction.of.ClaimLicenseFormSubmit({ payload: data }));

    const submitErrorMessage = pipe(
        error,
        O.fold(
            () => (<div></div>),
            ({ name, message }) => (<p>{message}</p>),
        ),
    );

    const submitSuccessMessage = pipe(
        result,
        O.fold(
            () => (<div></div>),
            ({ deviceId }) => (<p>{deviceId} claimed!</p>),
        ),
    );

    return (<div>
        <Menu attached>
            <Menu.Item>
                <Header>
                    Claim an existing License
                </Header>
            </Menu.Item>
        </Menu>
        <Segment attached>
            <Form onSubmit={handleSubmit(onSubmit)}>
                {submitErrorMessage}
                {submitSuccessMessage}
                <label>Device Id:</label>
                <Controller
                    control={control}
                    name='deviceId'
                    rules={{ required: true }}
                    defaultValue=''
                    render={({ onBlur, onChange, value }) => (
                        <div>
                            <Form.Input
                                type='text'
                                value={value}
                                onBlur={onBlur}
                                onChange={onChange}
                            />
                            {!!errors.deviceId && <p>{errors.deviceId.message}</p>}
                        </div>
                    )}
                />
                <Button
                    type='submit'
                    content='Claim License'
                />
            </Form>
        </Segment>
    </div>);

}
