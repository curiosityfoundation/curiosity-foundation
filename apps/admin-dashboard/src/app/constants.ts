import { Logger } from '@curiosity-foundation/service-logger';
import { Auth, AuthConfig, AuthState } from '@curiosity-foundation/feature-auth';

export type Env = Logger & Auth & AuthConfig;

export type State = {
    auth: AuthState,
};
