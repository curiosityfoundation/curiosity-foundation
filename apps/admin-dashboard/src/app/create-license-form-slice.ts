import * as M from '@effect-ts/morphic';

import { ClaimedLicense, DeviceId } from '@curiosity-foundation/feature-licenses';
import { makeFormSlice } from '@curiosity-foundation/util-types';

const ClaimLicenseFormError = M.make((F) => F.interface({
    name: F.string(),
    message: F.string(),
}));

const slice = makeFormSlice(
    'CreateLicenseFormSubmit',
    'CreateLicenseFormFailure',
    'CreateLicenseFormSuccess',
    'CreateLicenseFormReset',
    'CreateLicenseFormInflight',
)(
    DeviceId,
    ClaimLicenseFormError,
    ClaimedLicense,
);

export const {
    Action: CreateLicenseFormAction,
    State: CreateLicenseFormState,
    reducer: createLicenseFormReducer,
    foldStateToFormProps,
} = slice;

export type CreateLicenseFormAction = M.AType<typeof CreateLicenseFormAction>;
export type CreateLicenseFormState = M.AType<typeof CreateLicenseFormState>;
