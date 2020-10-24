import * as M from '@effect-ts/morphic';

import { ClaimedLicense, DeviceId } from '@curiosity-foundation/feature-licenses';
import { makeFormSlice } from '@curiosity-foundation/util-types';

const ClaimLicenseFormError = M.make((F) => F.interface({
    name: F.string(),
    message: F.string(),
}));

const slice = makeFormSlice(
    'ClaimLicenseFormSubmit',
    'ClaimLicenseFormFailure',
    'ClaimLicenseFormSuccess',
    'ClaimLicenseFormReset',
    'ClaimLicenseFormInflight',
)(
    DeviceId,
    ClaimLicenseFormError,
    ClaimedLicense,
);

export const {
    Action: ClaimLicenseFormAction,
    State: ClaimLicenseFormState,
    reducer: claimLicenseFormReducer,
    foldStateToFormProps,
} = slice;

export type ClaimLicenseFormAction = M.AType<typeof ClaimLicenseFormAction>;
export type ClaimLicenseFormState = M.AType<typeof ClaimLicenseFormState>;
