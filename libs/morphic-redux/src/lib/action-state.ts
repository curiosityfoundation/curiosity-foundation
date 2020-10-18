import * as M from '@effect-ts/morphic';

export const makeAction = <T extends string>(type: T) =>
    M.make((F) => F.interface({
        type: F.stringLiteral(type),
    }, { name: type }));

export const makePayloadAction = <T extends string, P extends object = {}, O extends object = {}>(
    type: T,
    payload: M.M<any, Readonly<P>, Readonly<O>>,
) =>
    M.make((F) => F.interface({
        type: F.stringLiteral(type),
        payload: payload(F),
    }, { name: type }));
