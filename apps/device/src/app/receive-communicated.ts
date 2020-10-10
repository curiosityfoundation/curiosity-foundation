import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as E from 'fp-ts/Either';

import { CommunicationEvent, listen } from '@curiosity-foundation/service-communication';
import { DeviceMessage } from '@curiosity-foundation/types-messages';
import { log, verbose } from '@curiosity-foundation/service-logger';

import { DeviceConfig, DeviceConfigURI } from './constants';

export const receiveCommunicatedMessages = pipe(
    T.access(({ [DeviceConfigURI]: config }: DeviceConfig) => config),
    T.chain((config) => pipe(
        log(`listening for messages on channel ${config.readChannel}`),
        T.andThen(pipe(
            listen([config.readChannel]),
            S.mapM((ev) => pipe(
                verbose(`${ev._tag} communication event received`),
                T.andThen(T.succeed(ev)),
            )),
            S.mapConcat(CommunicationEvent.matchStrict<DeviceMessage[]>({
                publishResponse: () => [],
                presence: () => [],
                status: () => [],
                message: ({ message }) => pipe(
                    message,
                    DeviceMessage.type.decode,
                    E.fold(
                        () => [],
                        (msg) => [msg],
                    ),
                ),
                historyMessage: () => [],
            })),
            S.chain((msg) => S.fromEffect(pipe(
                verbose(`${msg.type} message decoded`),
                T.andThen(T.succeed(msg)),
            ))),
            T.succeed,
        )),
    )),
);
