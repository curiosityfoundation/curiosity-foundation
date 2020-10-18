import { Logger } from '@curiosity-foundation/service-logger';
import { SPAAuth, AuthConfig, AuthState } from '@curiosity-foundation/feature-auth';
import { UnclaimedLicensesState } from '@curiosity-foundation/feature-licenses';

export const AppConfigURI = 'AppConfigURI';
export type AppConfigURI = typeof AppConfigURI;

export type AppConfig = {
    [AppConfigURI]: {
        apiURL: string;
    };
};

export type Env = AppConfig & Logger & SPAAuth & AuthConfig;

export type State = {
    auth: AuthState;
    unclaimedLicenses: UnclaimedLicensesState;
};
