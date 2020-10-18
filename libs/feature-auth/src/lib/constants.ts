import * as auth0SPA from '@auth0/auth0-spa-js';

import { BrowserAuthService } from './browser-auth-service';

export const AuthConfigURI = 'AuthConfigURI';
export type AuthConfigURI = typeof AuthConfigURI;

export type AuthConfig = {
    [AuthConfigURI]: {
        clientId: string;
        domain: string;
        redirectURI: string;
        audience: string;
        callbackURL: string;
        scope: string;
        responseType: string;
    };
};

export const SPAAuthURI = 'SPAAuthURI';
export type SPAAuthURI = typeof SPAAuthURI;

export type SPAAuth = {
    [SPAAuthURI]: auth0SPA.Auth0Client;
};

export const BrowserAuthURI = 'BrowserAuthURI';
export type BrowserAuthURI = typeof BrowserAuthURI;

export type BrowserAuth = {
    [BrowserAuthURI]: BrowserAuthService;
};
