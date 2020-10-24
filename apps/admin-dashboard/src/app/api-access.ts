import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import { tag } from '@effect-ts/core/Has';
import * as ADT from '@effect-ts/morphic/Adt';
import { DecodeError } from '@effect-ts/morphic/Decoder/common';

import {
  decodeClaimedLicense,
  decodeClaimedLicenseList,
  decodeUnclaimedLicense,
  decodeUnclaimedLicenseList,
  DeviceId,
} from '@curiosity-foundation/feature-licenses';
import * as H from '@curiosity-foundation/feature-http-client';

import { accessAppConfigM } from './config';

export const APIAccessError = ADT.makeADT('_tag')({
  DecodeError: ADT.ofType<DecodeError>(),
  HTTPErrorRequest: ADT.ofType<H.HTTPRequestError>(),
  HTTPErrorResponse: ADT.ofType<H.HTTPResponseError<string>>(),
});

type APIAccessConfig = {
  APIURL: string;
}

const makeAPIAccess = (config: APIAccessConfig) => ({
  getClaimedLicenses: (accessToken: string) =>
    pipe(
      H.get(`${config.APIURL}/licenses/claimed`),
      H.withHeaders({
        authorization: accessToken,
      }),
      T.chain((resp) =>
        pipe(
          resp.body,
          O.getOrElse(() => ({})),
          decodeClaimedLicenseList,
        ),
      ),
    ),
  getUnclaimedLicenses: (accessToken: string) =>
    pipe(
      H.get(`${config.APIURL}/licenses/unclaimed`),
      H.withHeaders({
        authorization: accessToken,
      }),
      T.chain((resp) =>
        pipe(
          resp.body,
          O.getOrElse(() => ({})),
          decodeUnclaimedLicenseList,
        ),
      ),
    ),
  createUnlaimedLicense: (accessToken: string, data: DeviceId) =>
    pipe(
      H.post(`${config.APIURL}/licenses/unclaimed`, data),
      H.withHeaders({
        authorization: accessToken,
      }),
      T.chain((resp) =>
        pipe(
          resp.body,
          O.getOrElse(() => ({})),
          decodeUnclaimedLicense,
        ),
      ),
    ),
  claimLicense: (accessToken: string, data: DeviceId) =>
    pipe(
      H.post(`${config.APIURL}/licenses/claim`, data),
      H.withHeaders({
        authorization: accessToken,
      }),
      T.chain((resp) =>
        pipe(
          resp.body,
          O.getOrElse(() => ({})),
          decodeClaimedLicense,
        ),
      ),
    ),
});

export interface APIAccess extends ReturnType<typeof makeAPIAccess> { }

export const APIAccess = tag<APIAccess>();

export const APIAccessLive = (config: APIAccessConfig) =>
  L.pure(APIAccess)(makeAPIAccess(config));

export const {
  claimLicense,
  createUnlaimedLicense,
  getClaimedLicenses,
  getUnclaimedLicenses,
} = T.deriveLifted(
  APIAccess
)(['getClaimedLicenses', 'getUnclaimedLicenses', 'claimLicense', 'createUnlaimedLicense'], [] as never, [] as never[])
