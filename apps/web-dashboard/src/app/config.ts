import * as T from '@effect-ts/core/Effect';
import { tag } from '@effect-ts/core/Has';
import * as L from '@effect-ts/core/Effect/Layer';

export type AppConfig = {
    readChannel: string;
    writeChannel: string;
};

export const AppConfig = tag<AppConfig>();

export const AppConfigLive = (config: AppConfig) =>
    L.fromConstructor(AppConfig)(() => config)();

export const accessAppConfig = T.accessService(AppConfig);
export const accessAppConfigM = T.accessServiceM(AppConfig);
