import * as assert from 'assert';

import * as Rx from 'rxjs';
import { take } from 'rxjs/operators';

import * as O from './rxjs';

import * as A from '@effect-ts/core/Classic/Array';
import * as T from '@effect-ts/core/Effect';
import * as E from '@effect-ts/core/Classic/Either';
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as S from '@effect-ts/core/Effect/Stream';

describe.only('RxJS', () => {
    jest.setTimeout(5000)

    it('should encaseObservable', async () => {
        const s = O.encaseObservable(take(10)(Rx.interval(10)), E.toError)
        
        const p = S.runCollect(s)

        const r = await T.runPromise(p)

        assert.deepStrictEqual(r, A.range(0, 9))
    })

      it('should encaseObservable - complete', async () => {
        const s = O.encaseObservable(Rx.from([0, 1, 2]), E.toError)
        const p = S.runCollect(s)

        const r = await T.runPromise(p)

        assert.deepStrictEqual(r, A.range(0, 2))
      })

    //   it('should encaseObservable - subject', async () => {
    //     const subject = new Rx.Subject()
    //     const s = O.encaseObservable(subject, E.toError)
    //     const p = S.collectArray(s)

    //     subject.next(0)
    //     subject.next(1)

    //     const results = T.runToPromise(p)

    //     subject.next(2)
    //     subject.next(3)
    //     subject.complete()

    //     const r = await results

    //     assert.deepStrictEqual(r, A.range(2, 3))
    //   })

    //   it('should encaseObservable - replay subject', async () => {
    //     const subject = new Rx.ReplaySubject(1)
    //     const s = O.encaseObservable(subject, E.toError)
    //     const p = S.collectArray(s)

    //     subject.next(0)
    //     subject.next(1)

    //     const results = T.runToPromise(p)

    //     subject.next(2)
    //     subject.next(3)
    //     subject.complete()

    //     const r = await results

    //     assert.deepStrictEqual(r, A.range(1, 3))
    //   })

    //   it('should encaseObservable - error', async () => {
    //     const s = O.encaseObservable(Rx.throwError(new Error('error')), E.toError)
    //     const p = S.collectArray(S.take_(s, 10))

    //     const r = await T.runToPromiseExit(p)

    //     assert.deepStrictEqual(r, raise(new Error('error')))
    //   })

    //   it('should runToObservable', async () => {
    //     const s = S.fromArray([0, 1, 2])
    //     const o = O.toObservable(s)

    //     const a: number[] = []

    //     O.runToObservable(o).subscribe((n) => {
    //       a.push(n)
    //     })

    //     await T.runToPromise(T.delay(T.unit, 10))

    //     assert.deepStrictEqual(a, [0, 1, 2])
    //   })

    //   it('should runToObservable - Error', async () => {
    //     const s = S.raised('error')
    //     const o = O.toObservable(s)

    //     const a = []
    //     const errors: unknown[] = []

    //     O.runToObservable(o).subscribe(
    //       (n) => {
    //         a.push(n)
    //       },
    //       (e) => {
    //         errors.push(e)
    //       }
    //     )

    //     await T.runToPromise(T.delay(T.unit, 10))

    //     assert.deepStrictEqual(errors, ['error'])
    //   })

    //   it('should runToObservable - Abort', async () => {
    //     const s = S.aborted('error')
    //     const o = O.toObservable(s)

    //     const a = []
    //     const errors: unknown[] = []

    //     O.runToObservable(o).subscribe(
    //       (n) => {
    //         a.push(n)
    //       },
    //       (e) => {
    //         errors.push(e)
    //       }
    //     )

    //     await T.runToPromise(T.delay(T.unit, 10))

    //     assert.deepStrictEqual(errors, ['error'])
    //   })

    //   it('should toObservable - Error', async () => {
    //     const s = S.raised(new Error('error'))
    //     const o = O.toObservable(s)

    //     const r = await T.runToPromise(o)

    //     const a = []
    //     const errors: unknown[] = []

    //     const sub = r.subscribe(
    //       (n) => {
    //         a.push(n)
    //       },
    //       (e) => {
    //         errors.push(e)
    //       }
    //     )

    //     await T.runToPromise(T.delay(T.unit, 10))

    //     assert.deepStrictEqual(errors, [new Error('error')])
    //     assert.deepStrictEqual(sub.closed, true)
    //   })

    //   it('should toObservable - Abort', async () => {
    //     const s = S.aborted('aborted')
    //     const o = O.toObservable(s)

    //     const r = await T.runToPromise(o)

    //     const a = []
    //     const errors: unknown[] = []

    //     const sub = r.subscribe(
    //       (n) => {
    //         a.push(n)
    //       },
    //       (e) => {
    //         errors.push(e)
    //       }
    //     )

    //     await T.runToPromise(T.delay(T.unit, 10))

    //     assert.deepStrictEqual(errors, ['aborted'])
    //     assert.deepStrictEqual(sub.closed, true)
    //   })

    //   it('unsubscribe should stop drain', async () => {
    //     const s = S.chain_(S.repeatedly(0), (n) => S.encaseEffect(T.delay(T.pure(n), 10)))
    //     const o = O.toObservable(s)

    //     const r = await T.runToPromise(o)

    //     const a = []
    //     const errors: unknown[] = []

    //     const sub = r.subscribe(
    //       (n) => {
    //         a.push(n)
    //       },
    //       (e) => {
    //         errors.push(e)
    //       }
    //     )

    //     await T.runToPromise(T.delay(T.unit, 100))

    //     sub.unsubscribe()

    //     assert.deepStrictEqual(errors, [])
    //     assert.deepStrictEqual(sub.closed, true)
    //   })
})