import { makeADT, ofType, ADTType } from '@effect-ts/morphic/Adt';
import type * as Pubnub from 'pubnub';

export const MessagingEvent = makeADT('_tag')({
    status: ofType<Pubnub.StatusEvent & { _tag: 'status' }>(),
    message: ofType<Pubnub.MessageEvent & { _tag: 'message' }>(),
    presence: ofType<Pubnub.PresenceEvent & { _tag: 'presence' }>(),
    publishResponse: ofType<Pubnub.PublishResponse & { _tag: 'publishResponse' }>(),
    historyMessage: ofType<Pubnub.HistoryMessage & { _tag: 'historyMessage' }>(),
});

export type MessagingEvent = ADTType<typeof MessagingEvent>;
