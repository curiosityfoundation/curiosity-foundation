import { has } from '@effect-ts/core/Classic/Has'
import * as T from '@effect-ts/core/Effect'
import * as L from '@effect-ts/core/Effect/Layer';
import type { Auth0Client as Auth0Client_ } from '@auth0/auth0-spa-js';

export interface Auth0Client {
    client: Auth0Client_;
}

export const Auth0Client = has<Auth0Client>();

export const accessAuth0Client = T.accessService(Auth0Client);
export const accessAuth0ClientM = T.accessServiceM(Auth0Client);

export const Auth0ClientLive = (client: Auth0Client_) =>
    L.fromConstructor(Auth0Client)(() => ({ client }))();
