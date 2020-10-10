import { Communication } from '@curiosity-foundation/service-communication';
import { Logger } from '@curiosity-foundation/service-logger';

export const AppConfigURI = 'AppConfigURI';
export type AppConfigURI = typeof AppConfigURI;

export type AppConfig = {
    [AppConfigURI]: {
        readChannel: string;
        writeChannel: string;        
    };
};

export type Env = Logger & AppConfig & Communication;
