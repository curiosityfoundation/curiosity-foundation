import * as O from '@effect-ts/core/Classic/Option';
import * as M from '@effect-ts/morphic';

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

export function makeSimpleState<T extends string>(name: T) {
    return M.make((F) => F.interface({
        state: F.stringLiteral(name),
    }, { name }));
}

export function makeState<
    T extends string,
    P,
    O,
    >(
        name: T,
        data: M.M<{}, Readonly<P>, Readonly<O>>,
) {
    return M.make((F) => F.intersection([
        F.interface({
            state: F.stringLiteral(name),
        }),
        data(F),
    ], { name }));
}

export function makeIdTable<P, O,>(
    data: M.M<{}, Readonly<P>, Readonly<O>>,
) {
    return M.make((F) => F.interface({
        byId: F.record(data(F)),
        allIds: F.array(F.string()),
    }));
}

// ASYNC

export function makeAsyncSlice<
    FetchT extends string,
    FailureT extends string,
    SuccessT extends string,
    ResetT extends string,
    InflightT extends string,
    >(
        fetchType: FetchT,
        failureType: FailureT,
        successType: SuccessT,
        resetType: ResetT,
        inflightType: InflightT,
) {

    return function <
        E extends {},
        EO extends {},
        R extends {},
        RO extends {},
        >(
            error: M.M<{}, Readonly<E>, Readonly<EO>>,
            result: M.M<{}, Readonly<R>, Readonly<RO>>,
    ) {

        return function <
            F extends {},
            FO extends {},
            S extends {},
            SO extends {},
            >(
                failure: M.M<{}, Readonly<F>, Readonly<FO>>,
                success: M.M<{}, Readonly<S>, Readonly<SO>>,
                mergeFailure: (f: FO) => (e: O.Option<EO>) => EO,
                mergeSuccess: (s: SO) => (r: O.Option<RO>) => RO,
        ) {

            const Fetch = makeAction(fetchType);
            type Fetch = M.AType<typeof Fetch>;
            const Inflight = makeAction(inflightType);
            type Inflight = M.AType<typeof Inflight>;
            const Failure = makePayloadAction(failureType, failure);
            type Failure = M.AType<typeof Failure>;
            const Success = makePayloadAction(successType, success);
            type Success = M.AType<typeof Success>;
            const Reset = makeAction(resetType);
            type Reset = M.AType<typeof Reset>;

            const Action = M.makeADT('type')({
                [fetchType]: Fetch,
                [failureType]: Failure,
                [successType]: Success,
                [inflightType]: Inflight,
                [resetType]: Reset,
            });

            const Init = makeSimpleState('Init');
            const Pending = makeSimpleState('Pending');
            const Left = makeState(
                'Left',
                M.make((F) => F.interface({
                    refreshing: F.boolean(),
                    error: error(F),
                })),
            );

            const Right = makeState(
                'Right',
                M.make((F) => F.interface({
                    refreshing: F.boolean(),
                    result: result(F),
                })),
            );

            const Both = makeState(
                'Both',
                M.make((F) => F.interface({
                    refreshing: F.boolean(),
                    error: error(F),
                    result: result(F),
                })),
            );

            const State = M.makeADT('state')({
                Init,
                Pending,
                Left,
                Right,
                Both,
            });

            type State = M.AType<typeof State>

            const reducer = Action.createReducer(State.of.Init({}))({
                [fetchType]: (_: Fetch) => (s: State) => s,
                [resetType]: (_: Reset) => (_: State) => State.of.Init({}),
                [inflightType]: (_: Inflight) => State.transform({
                    Init: () => State.of.Pending({}),
                    Left: ({ error }) => State.of.Left({
                        error,
                        refreshing: true,
                    }),
                    Right: ({ result }) => State.of.Right({
                        result,
                        refreshing: true,
                    }),
                    Both: ({ result, error }) => State.of.Both({
                        error,
                        result,
                        refreshing: true,
                    }),
                }),
                [failureType]: ({ payload }: Failure) => State.transform({
                    Pending: () => State.of.Left({
                        error: mergeFailure(payload)(O.none),
                        refreshing: false,
                    }),
                    Left: ({ error }) => State.of.Left({
                        error: mergeFailure(payload)(O.some(error)),
                        refreshing: false,
                    }),
                    Right: ({ result }) => State.of.Both({
                        error: mergeFailure(payload)(O.none),
                        result,
                        refreshing: false,
                    }),
                    Both: ({ error, result }) => State.of.Both({
                        error: mergeFailure(payload)(O.some(error)),
                        result,
                        refreshing: false,
                    }),
                }),
                [successType]: ({ payload }: Success) => State.transform({
                    Pending: () => State.of.Right({
                        result: mergeSuccess(payload)(O.none),
                        refreshing: false,
                    }),
                    Left: () => State.of.Right({
                        result: mergeSuccess(payload)(O.none),
                        refreshing: false,
                    }),
                    Right: ({ result }) => State.of.Right({
                        result: mergeSuccess(payload)(O.some(result)),
                        refreshing: false,
                    }),
                    Both: ({ result }) => State.of.Right({
                        result: mergeSuccess(payload)(O.some(result)),
                        refreshing: false,
                    }),
                }),
            } as any);

            return { Action, State, reducer };

        }

    }

}

// Form

export function makeFormSlice<
    SubmitT extends string,
    FailureT extends string,
    SuccessT extends string,
    ResetT extends string,
    InflightT extends string,
    >(
        submitType: SubmitT,
        failureType: FailureT,
        successType: SuccessT,
        resetType: ResetT,
        inflightType: InflightT,
) {

    return function <
        D extends {},
        DO extends {},
        E extends {},
        EO extends {},
        R extends {},
        RO extends {},
        >(
            data: M.M<{}, Readonly<D>, Readonly<DO>>,
            error: M.M<{}, Readonly<E>, Readonly<EO>>,
            result: M.M<{}, Readonly<R>, Readonly<RO>>,
    ) {

        const Submit = makePayloadAction(submitType, data);
        type Submit = M.AType<typeof Submit>;
        const Inflight = makeAction(inflightType);
        type Inflight = M.AType<typeof Inflight>;
        const Failure = makePayloadAction(failureType, error);
        type Failure = M.AType<typeof Failure>;
        const Success = makePayloadAction(successType, result);
        type Success = M.AType<typeof Success>;
        const Reset = makeAction(resetType);
        type Reset = M.AType<typeof Reset>;

        const Action = M.makeADT('type')({
            [submitType]: Submit,
            [failureType]: Failure,
            [successType]: Success,
            [inflightType]: Inflight,
            [resetType]: Reset,
        });

        const Init = makeSimpleState('Init');
        const Submitting = makeSimpleState('Submitting');
        const Left = makeState(
            'Left',
            M.make((F) => F.interface({
                submitting: F.boolean(),
                error: error(F),
            })),
        );

        const Right = makeState(
            'Right',
            M.make((F) => F.interface({
                submitting: F.boolean(),
                result: result(F),
            })),
        );

        const State = M.makeADT('state')({
            Init,
            Submitting,
            Left,
            Right,
        });

        type State = M.AType<typeof State>

        const reducer = Action.createReducer(State.of.Init({}))({
            [submitType]: (_: Submit) => (s: State) => s,
            [resetType]: (_: Reset) => (_: State) => State.of.Init({}),
            [inflightType]: (_: Inflight) => State.transform({
                Init: () => State.of.Submitting({}),
                Left: ({ error }) => State.of.Left({
                    error,
                    submitting: true,
                }),
                Right: ({ result }) => State.of.Right({
                    result,
                    submitting: true,
                }),
            }),
            [failureType]: ({ payload }: Failure) => State.transform({
                Submitting: () => State.of.Left({
                    error: payload,
                    submitting: false,
                }),
                Left: () => State.of.Left({
                    error: payload,
                    submitting: false,
                }),
                Right: () => State.of.Left({
                    error: payload,
                    submitting: false,
                }),
            }),
            [successType]: ({ payload }: Success) => State.transform({
                Submitting: () => State.of.Right({
                    result: payload,
                    submitting: false,
                }),
                Left: () => State.of.Right({
                    result: payload,
                    submitting: false,
                }),
                Right: () => State.of.Right({
                    result: payload,
                    submitting: false,
                }),
            }),
        } as any);

        const foldStateToFormProps = State.matchStrict<{
            isSubmitting: boolean;
            error: O.Option<EO>;
            result: O.Option<RO>;
        }>({
            Init: () => ({
                isSubmitting: false,
                error: O.none,
                result: O.none,
            }),
            Submitting: () => ({
                isSubmitting: true,
                error: O.none,
                result: O.none,
            }),
            Left: ({ error }) => ({
                isSubmitting: false,
                error: O.some(error),
                result: O.none,
            }),
            Right: ({ result }) => ({
                isSubmitting: false,
                error: O.none,
                result: O.some(result),
            }),
        });

        return { Action, State, reducer, foldStateToFormProps };

    }

}
