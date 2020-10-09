
import * as Rx from 'rxjs'

import * as T from '@effect-ts/core/Effect'
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as M from '@effect-ts/core/Effect/Managed'
import * as S from '@effect-ts/core/Effect/Stream'
import { pipe } from '@effect-ts/core/Function'
import * as O from '@effect-ts/core/Classic/Option'
import * as Q from '@effect-ts/core/Effect/Queue'
import { u} from '@effect-ts/core/Effect/'

export function encaseObservable<E, A>(
    observable: Rx.Observable<A>,
    onError: (e: unknown) => E,
): S.IO<E, A> {
    S.fromQueue(Q.)
    return S.effectAsync((cb) => {
        
        const queue = Q.createQueue(new Q.BackPressureStrategy())
        const handle = observable.subscribe(
            (a) => cb(T.succeed([a])),
            (e) => cb(T.fail(O.some(onError(e)))),
            () => {
                cb(T.fail(O.none));
                handle.unsubscribe();
            },
        )
    });
    // return pipe(
    //     T.bracket(
    //         (handle) => T.effectTotal(() => observable.subscribe(console.log)),
    //         (handle: Rx.Subscription) => T.effectTotal(handle.unsubscribe),
    //     )(T.effectTotal(() => observable.subscribe(console.log))),
    //     S.fromEffect,
    // )
}

export function runToObservable<A>(o: T.UIO<Rx.Observable<A>>): Rx.Observable<A> {
    return new Rx.Observable((sub) => {
        T.run(
            o,
            Ex.fold(
                (e) => {
                    /* istanbul ignore next */
                    sub.error(e)
                },
                (ob) => {
                    const running = ob.subscribe(
                        (r) => {
                            sub.next(r)
                        },
                        (e) => {
                            sub.error(e)
                        },
                        () => {
                            sub.complete()
                        }
                    )

                    sub.unsubscribe = () => {
                        running.unsubscribe()
                        sub.closed = true
                    }
                },
            )
        )
    })
}

export function toObservable<S, R, E, A>(
    s: S.Stream<R, E, A>
): T.RIO<R, Rx.Observable<A>> {
    return T.access(
        (r: R) =>
            new Rx.Observable((sub) => {
                const drainer = pipe(
                    s,
                    S.mapM((a) => T.effectTotal(() => {
                        sub.next(a)
                    })),
                    S.runDrain,
                    T.provide(r),
                );

                const cleanup = Ex.fold(
                    () => {
                        sub.complete()
                    },
                    (e) => {
                        sub.error(e)
                        sub.unsubscribe()
                    },
                )

                const interruptDrain = T.runCancel(
                    drainer,
                    cleanup,
                )

                sub.unsubscribe = () => {
                    sub.closed = true
                    T.run(interruptDrain, cleanup)
                }
            })
    )
}