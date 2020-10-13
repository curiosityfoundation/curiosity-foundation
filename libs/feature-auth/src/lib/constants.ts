import { Auth0Client } from '@auth0/auth0-spa-js';

export const AuthConfigURI = 'AuthConfigURI';
export type AuthConfigURI = typeof AuthConfigURI;

export type AuthConfig = {
    [AuthConfigURI]: {
        clientId: string;
        domain: string;
        redirectURI: string;
    };
};

export const AuthURI = 'AuthURI';
export type AuthURI = typeof AuthURI;

export type Auth = {
    [AuthURI]: Auth0Client;
};
