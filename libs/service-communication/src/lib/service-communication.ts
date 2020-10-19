import * as O from '@effect-ts/core/Classic/Option';
import * as E from '@effect-ts/core/Classic/Either';
import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import { summonFor, AsOpaque } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { AOfMorhpADT, AType, EType } from "@morphic-ts/summoners";

import { ADTType, ofType, makeADT } from '@morphic-ts/adt';
import { verbose } from '@curiosity-foundation/service-logger';
import type * as Pubnub from 'pubnub';

const { summon, tagged } = summonFor<{}>({});

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
    historyMessage: ofType<Pubnub.HistoryMessage & { _tag: 'historyMessage' }>(),
});

export type CommunicationEvent = ADTType<typeof CommunicationEvent>;

const subscribe = (channels: string[]) => pipe(
    verbose(`subscribing to channels ${channels}`),
    T.andThen(T.accessM(({ [CommunicationURI]: communication }: Communication) =>
        T.effectTotal(() => communication.subscribe({ channels })),
    )),
);

const unsubscribe = (channels: string[]) => () => pipe(
    verbose(`unsubscribing to channels ${channels}`),
    T.andThen(T.accessM(({ [CommunicationURI]: communication }: Communication) =>
        T.effectTotal(() => communication.unsubscribe({ channels })),
    )),
);

export const publish = (channel: string, message: unknown) => pipe(
    T.accessM(({ [CommunicationURI]: communication }: Communication) =>
        T.fromPromise(() => communication.publish({
            channel,
            message,
        })),
    ),
    T.map(CommunicationEvent.of.publishResponse),
);

export const listen = (channels: string[]) => pipe(
    S.bracket(unsubscribe(channels))(subscribe(channels)),
    S.chain(() => S.access(({ [CommunicationURI]: communication }: Communication) => communication)),
    S.chain((communication) => S.effectAsync<{}, unknown, CommunicationEvent>((cb) => {
        communication.addListener({
            status: (ev) => cb(T.succeed([CommunicationEvent.of.status(ev)])),
            message: (ev) => cb(T.succeed([CommunicationEvent.of.message(ev)])),
            presence: (ev) => cb(T.succeed([CommunicationEvent.of.presence({ state: null, ...ev })])),
        });
    })),
);

export const getHistory = (channel: string, count: number) => pipe(
    S.access(({ [CommunicationURI]: communication }: Communication) => communication),
    S.chain((communication) => S.effectAsync<{}, unknown, Pubnub.HistoryMessage>((cb) => {
        communication.history({
            channel,
            count,
        }).then(
            (response) => {
                cb(T.succeed(pipe(
                    response.messages,
                )));
                cb(T.fail(O.none));
            },
            (err) => {
                console.log('ERROR!!!', err);
                cb(T.fail(O.none))
            },
        );
    })),
    S.map(CommunicationEvent.of.historyMessage),
);

const StartListening_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('StartListening'),
        },
        'StartListening'
    ),
);
export interface StartListening extends AType<typeof StartListening_> { };
type StartListeningRaw = EType<typeof StartListening_>;
export const StartListening = AsOpaque<StartListeningRaw, StartListening>()(StartListening_);

const StopListening_ = summon((F) =>
    F.interface(
        {
            type: F.stringLiteral('StopListening'),
        },
        'StopListening'
    ),
);
export interface StopListening extends AType<typeof StopListening_> { };
type StopListeningRaw = EType<typeof StopListening_>;
export const StopListening = AsOpaque<StopListeningRaw, StopListening>()(StopListening_);

export const CommunicationAction = tagged('type')({
    StartListening,
    StopListening,
});

export type CommunicationAction = AOfMorhpADT<typeof CommunicationAction>;
