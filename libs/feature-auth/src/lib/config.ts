import * as T from '@effect-ts/core/Effect';
import { has } from '@effect-ts/core/Classic/Has';
import * as L from '@effect-ts/core/Effect/Layer';

export type Auth0Config = {
    clientId: string;
    domain: string;
    redirectURI: string;
    audience: string;
    callbackURL: string;
    scope: string;
    responseType: string;
};

export const Auth0Config = has<Auth0Config>();

export const Auth0ConfigLive = (config: Auth0Config) =>
    L.fromConstructor(Auth0Config)(() => config)();

export const accessAuth0Config = T.accessService(Auth0Config);
export const accessAuth0ConfigM = T.accessServiceM(Auth0Config);
