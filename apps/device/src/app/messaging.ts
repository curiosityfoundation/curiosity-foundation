import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { MessagingEvent, listen } from '@curiosity-foundation/feature-messaging';
import { decodeDeviceAction } from '@curiosity-foundation/feature-device-io';
import { info, verbose } from '@curiosity-foundation/feature-logging';

import { accessAppConfigM } from './config';

export const messagingActions = pipe(
    accessAppConfigM((config) => pipe(
        info(`listening for messages on channel ${config.readChannel}`),
        T.andThen(pipe(
            listen([config.readChannel]),
            S.mapConcat(MessagingEvent.matchStrict<unknown[]>({
                publishResponse: () => [],
                presence: () => [],
                status: () => [],
                message: ({ message }) => [message],
                historyMessage: () => [],
            })),
            S.mapConcatM((data) => pipe(
                data,
                decodeDeviceAction,
                T.map((message) => [message]),
            )),
            S.chain((msg) => S.fromEffect(pipe(
                verbose(`${msg.type} message decoded`),
                T.andThen(T.succeed(msg)),
            ))),
            T.succeed,
        )),
    )),
    S.fromEffect,
    S.flatten,
);
