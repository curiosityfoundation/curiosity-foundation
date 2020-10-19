import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { LicensesAction } from './action';

export const fetchUnclaimedLicenses = 
    (action$: S.UIO<LicensesAction>) => pipe(
        action$,
    );
