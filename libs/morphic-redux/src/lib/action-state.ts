import { ProgramType } from '@morphic-ts/summoners';
import { ProgramNoUnionURI } from '@morphic-ts/batteries/lib/program-no-union';

import { summon, M, AppEnv } from './summoner';

export type MyProgram<E, A> = ProgramType<AppEnv, E, A>[ProgramNoUnionURI];

export interface TagTypeIs<Type> {
    type: Type;
}

export const Action = <T extends string, E, P>(
    type: T,
    payload: MyProgram<E, P & { type?: never }>
): M<E & TagTypeIs<string>, P & TagTypeIs<T>> =>
    summon<E & TagTypeIs<string>, P & TagTypeIs<T>>((F) =>
        F.intersection(
            [
                F.interface(
                    {
                        type: F.stringLiteral(type),
                    },
                    `Tag '${type as string}'`
                ),
                payload(F),
            ],
            type,
        )
    );

export const State = <T extends string, E, P>(
    type: T,
    data: MyProgram<E, P & { type?: never }>
): M<E & TagTypeIs<string>, P & TagTypeIs<T>> =>
    summon<E & TagTypeIs<string>, P & TagTypeIs<T>>((F) =>
        F.intersection(
            [
                F.interface(
                    {
                        type: F.stringLiteral(type),
                    },
                    `Tag '${type as string}'`
                ),
                data(F),
            ],
            type,
        )
    );
