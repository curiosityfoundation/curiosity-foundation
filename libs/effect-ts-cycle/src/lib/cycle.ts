import * as A from '@effect-ts/core/Classic/NonEmptyArray';
import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as C from '@effect-ts/core/Effect/Cause'
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function'
import * as M from 'most';
import { Action } from 'redux';
import * as RC from 'redux-cycles';
import { encaseMost, runToMost, toMost } from './mostjs';

type ReduxSources<State, A extends Action> = {
    STATE: M.Stream<State>;
    ACTION: M.Stream<A>;
};

type ReduxSinks<O extends Action> = {
    ACTION: M.Stream<O>;
};

export interface Cycle<R, State, A extends Action = Action, O extends A = A> {
    _A: A
    _O: O
    _R: R
    _S: State
    (action$: S.UIO<A>, state$: S.UIO<State>): S.UIO<O>;
}

type AnyCycle = Cycle<any, any, any, any> | Cycle<any, any, any, never>;

type Env<K extends AnyCycle> = K['_R'];
type Sta<K extends AnyCycle> = K['_S'];
type Act<K extends AnyCycle> = K['_A'];
type AOut<K extends AnyCycle> = K['_O'];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

type CyclesEnvType<CS extends A.NonEmptyArray<AnyCycle>> = UnionToIntersection<
    Env<CS[number]>
>;

export type RCMain<State, A extends Action, O extends A> = RC.Main<ReduxSources<State, A>, ReduxSinks<O>>;

function toNever(_: any): never {
    return undefined as never;
};

export function embed<CS extends A.NonEmptyArray<AnyCycle>>(
    ...cycles: CS
): (
        provider: (
            _: T.Effect<CyclesEnvType<CS>, never, unknown>
        ) => T.Effect<T.DefaultEnv, never, unknown>
    ) => RCMain<Sta<CS[number]>, Act<CS[number]>, AOut<CS[number]>> {

    type CSType = CS[number];
    type Action = Act<CSType>;
    type State = Sta<CSType>;
    type ActionOut = AOut<CSType>;
    type REnv = CyclesEnvType<CS>;

    // cannot convince typechecker that array is nonempty
    return (provider) => (RC.combineCycles as any)(
        ...pipe(
            cycles as A.NonEmptyArray<Cycle<REnv, State, Action, ActionOut>>,
            A.map(
                (cycle): RCMain<State, Action, ActionOut> => ({
                    ACTION,
                    STATE,
                }: ReduxSources<State, Action>) => ({
                    ACTION: pipe(
                        toMost(cycle(
                            encaseMost(ACTION, toNever),
                            encaseMost(STATE, toNever),
                        )),
                        provider,
                        runToMost,
                    )
                })
            ),
        )
    );

};

export function cycle<State, A extends Action>(): <R, O extends A>(
    e: (action$: S.UIO<A>, state$: S.UIO<State>) => S.RIO<R, O>
) => Cycle<R, State, A, O> {
    return (e) => e as any
};
