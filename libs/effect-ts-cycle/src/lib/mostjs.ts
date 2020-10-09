import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as C from '@effect-ts/core/Effect/Cause'
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function'
import { create as createMost } from '@most/create';
import * as M from 'most';

export function encaseMost<E, A>(
    m: M.Stream<A>,
    onError: (e: unknown) => E
): S.IO<E, A> {
    return S.effectAsync((cb) => {
        m.forEach((a) => cb(T.succeed([a]))).then(
            () => cb(T.fail(O.none)),
            (err) => cb(T.fail(O.some(onError(err)))),
        );
    });
};

export function runToMost<A>(t: T.UIO<M.Stream<A>>): M.Stream<A> {
    return createMost((next, complete, error) => {
        T.run(
            t,
            Ex.fold(
                C.fold(
                    () => complete(),
                    (err) => error(err),
                    () => error(new Error('died')),
                    () => complete(),
                    () => complete(),
                    () => complete(),
                ),
                (m) => {
                    m.forEach((a) => next(a)).then(
                        () => complete(),
                        (err) => error(err),
                    );
                },
            ),
        );
    });
};

export function toMost<R, A>(s: S.Stream<R, Error, A>): T.RIO<R, M.Stream<A>> {
    return T.access((r) =>
        createMost((next, complete, error) => {

            const drainer = pipe(
                s,
                S.mapM((a) => T.effectTotal(() => {
                    next(a)
                })),
                S.runDrain,
                T.provide(r),
            );

            T.run(
                drainer,
                Ex.fold(
                    C.fold(
                        () => complete(),
                        (err) => error(err),
                        () => error(new Error('died')),
                        () => complete(),
                        () => complete(),
                        () => complete(),
                    ),
                    () => {
                        complete();
                    },
                ),
            );

        }));
};
