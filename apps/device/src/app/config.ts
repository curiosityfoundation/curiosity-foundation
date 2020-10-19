import * as T from '@effect-ts/core/Effect';
import { has } from '@effect-ts/core/Classic/Has';
import * as L from '@effect-ts/core/Effect/Layer';

export type AppConfig = {
    readChannel: string;
    writeChannel: string;
    readInterval: number;
};

export const AppConfig = has<AppConfig>();

export const AppConfigLive = (config: AppConfig) =>
    L.fromConstructor(AppConfig)(() => config)();

export const accessAppConfig = T.accessService(AppConfig);
export const accessAppConfigM = T.accessServiceM(AppConfig);
