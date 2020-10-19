import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { cycle } from '@curiosity-foundation/effect-ts-cycle';

import { LicensesAction } from './action';

export const fetchUnclaimedLicenses = cycle<any, LicensesAction>()(
    (action$) => pipe(
        action$,
    ),
);
