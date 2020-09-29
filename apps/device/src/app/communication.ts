import * as T from '@effect-ts/core/Effect';
import * as Schedule from '@effect-ts/system/Schedule';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import { ADTType, ofType, makeADT } from '@morphic-ts/adt';
import { removeListener } from 'process';
import * as Pubnub from 'pubnub';

export const CommunicationConfigURI = 'CommunicationConfigURI';
export type CommunicationConfigURI = typeof CommunicationConfigURI;

export type CommunicationConfig = {
    [CommunicationConfigURI]: Pubnub.PubnubConfig;
};

type Status = {
    _tag: 'status';
    ev: Pubnub.StatusEvent;
};

type Message = {
    _tag: 'message';
    ev: Pubnub.MessageEvent;
};

type Presence = {
    _tag: 'presence';
    ev: Pubnub.PresenceEvent;
};

type Published = {
    _tag: 'published';
    ev: Pubnub.PublishResponse;
};

export const CommunicationEvent = makeADT('_tag')({
    status: ofType<Status>(),
    message: ofType<Message>(),
    presence: ofType<Presence>(),
    published: ofType<Published>(),
});

type Reading = {
    device: string;
    sensor: number;
    reading: number;
};

const subscribe = (pubnub: Pubnub) =>
    T.effectTotal(() => pubnub.subscribe({
        channels: ['test'],
    }));

const unsubscribe = (pubnub: Pubnub) =>
    T.effectTotal(() => pubnub.unsubscribe({
        channels: ['test'],
    }));

export type CommunicationEvent = ADTType<typeof CommunicationEvent>;

export const communicate = (readings: S.Stream<any, {}, never, Reading>) => pipe(
    T.access(({ [CommunicationConfigURI]: config }: CommunicationConfig) => new Pubnub(config)),
    T.map((pubnub) => pipe(
        S.bracket(() => unsubscribe(pubnub))(subscribe(pubnub)),
        S.chain(() => S.concatAll([
            pipe(
                readings,
                S.chain((reading) => pipe(
                    T.fromPromise(() => pubnub.publish({ channel: 'test', message: reading })),
                    T.map((ev) => CommunicationEvent.of.published({ ev })),
                    S.fromEffect,
                )),
            ),
            S.effectAsync<{}, never, CommunicationEvent>((cb) => {
                pubnub.addListener({
                    status: (ev) => cb(T.succeed([CommunicationEvent.of.status({ ev })])),
                    message: (ev) => cb(T.succeed([CommunicationEvent.of.message({ ev })])),
                    presence: (ev) => cb(T.succeed([CommunicationEvent.of.presence({ ev })])),
                });
            }),
        ])),
    )),
);
