import * as T from '@effect-ts/core/Effect';
import * as M from '@effect-ts/morphic';
import { makeADT, ADT } from '@effect-ts/morphic/Adt';

export function makeAction<T extends string>(type: T) {
    return M.make((F) => F.interface({
        type: F.stringLiteral(type),
    }, { name: type }));
}

export function makePayloadAction<
    T extends string,
    P,
    O,
    >(
        type: T,
        payload: M.M<{}, Readonly<P>, Readonly<O>>,
) {
    return M.make((F) => F.interface({
        type: F.stringLiteral(type),
        payload: payload(F),
    }, { name: type }));
}

export function makeAsyncActions<
    T extends string,
    F extends string,
    S extends string,
    >(types: { Fetch: T, Success: S, Failure: F }) {
    return function <
        X,
        XO,
        E,
        EO,
        A,
        AO,
        >(
            inputT: M.M<{}, Readonly<X>, Readonly<XO>>,
            resultT: M.M<{}, Readonly<A>, Readonly<AO>>,
            errorT: M.M<{}, Readonly<E>, Readonly<EO>>,
    ) {

        const Action = M.makeADT('type')({
            [types.Fetch]: makePayloadAction(types.Fetch, inputT),
            [types.Success]: makePayloadAction(types.Success, resultT),
            [types.Failure]: makePayloadAction(types.Failure, errorT),
        });

        type Action = M.AType<typeof Action>;

        return Action;
    }
}
