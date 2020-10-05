import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as E from 'fp-ts/Either';

import { CommunicationEvent, listen } from '@curiosity-foundation/service-communication';
import { DeviceMessage } from '@curiosity-foundation/types-messages';
import { log } from '@curiosity-foundation/service-logger';

export const receiveCommunicatedMessages = pipe(
    log('listening for communicated messages'),
    T.andThen(pipe(
        listen([String(process.env.BALENA_DEVICE_NAME_AT_INIT)]),
        S.chain(CommunicationEvent.matchStrict({
            publishResponse: () => S.empty,
            status: () => S.empty,
            message: ({ message }) => pipe(
                message,
                DeviceMessage.type.decode,
                E.fold(
                    () => S.empty,
                    (msg) => S.fromArray([msg]),
                ),
            ),
            presence: () => S.empty,
        })),
        T.succeed,
    ))
);
