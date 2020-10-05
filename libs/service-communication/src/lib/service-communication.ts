import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';

import { ADTType, ofType, makeADT } from '@morphic-ts/adt';
import * as Pubnub from 'pubnub';

export const CommunicationURI = 'CommunicationURI';
export type CommunicationURI = typeof CommunicationURI;

export type Communication = {
    [CommunicationURI]: Pubnub;
};

export const CommunicationEvent = makeADT('_tag')({
    status: ofType<Pubnub.StatusEvent & { _tag: 'status' }>(),
    message: ofType<Pubnub.MessageEvent & { _tag: 'message' }>(),
    presence: ofType<Pubnub.PresenceEvent & { _tag: 'presence' }>(),
    publishResponse: ofType<Pubnub.PublishResponse & { _tag: 'publishResponse' }>(),
});

export type CommunicationEvent = ADTType<typeof CommunicationEvent>;

const subscribe = (channels: string[]) =>
    T.accessM(({ [CommunicationURI]: communication }: Communication) =>
        T.effectTotal(() => communication.subscribe({ channels })),
    );

const unsubscribe = (channels: string[]) =>
    T.accessM(({ [CommunicationURI]: communication }: Communication) =>
        T.effectTotal(() => communication.unsubscribe({ channels })),
    );

export const publish = (channel: string, message: unknown) => pipe(
    T.access(({ [CommunicationURI]: communication }: Communication) => communication),
    T.chain((communication) => T.fromPromise(() => communication.publish({
        channel,
        message,
    }))),
    T.map(CommunicationEvent.of.publishResponse),
);

export const listen = (channels: string[]) => pipe(
    S.bracket(() => unsubscribe(channels))(subscribe(channels)),
    S.chain(() => S.access(({ [CommunicationURI]: communication }: Communication) => communication)),
    S.chain((communication) => S.effectAsync<{}, never, CommunicationEvent>((cb) => {
        communication.addListener({
            status: (ev) => cb(T.succeed([CommunicationEvent.of.status(ev)])),
            message: (ev) => cb(T.succeed([CommunicationEvent.of.message(ev)])),
            presence: (ev) => cb(T.succeed([CommunicationEvent.of.presence({ state: null, ...ev })])),
        });
    })),
);
