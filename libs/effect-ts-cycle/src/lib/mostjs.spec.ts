import * as assert from 'assert';

import * as M from 'most';

import { encaseMost, toMost } from './mostjs';

import * as A from '@effect-ts/core/Classic/Array';
import * as T from '@effect-ts/core/Effect';
import * as E from '@effect-ts/core/Classic/Either';
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as S from '@effect-ts/core/Effect/Stream';
import * as Schedule from '@effect-ts/core/Effect/Schedule';

describe('mostjs stream', () => {

    jest.setTimeout(5000);

    describe('encaseMost', () => {

        it('should encase most stream - sync finite', async () => {
            const s = encaseMost(M.from(A.range(0, 9)), E.toError);

            const p = S.runCollect(s);

            const r = await T.runPromise(p);

            assert.deepStrictEqual(r, A.range(0, 9));
        });

        it('should encase most stream - async finite', async () => {
            const s = encaseMost(M.periodic(10).take(10), E.toError);

            const p = S.runCollect(s);

            const r = await T.runPromise(p);

            assert.deepStrictEqual(r.length, 10);
        });

        it('should encase most stream - error', async () => {
            const s = encaseMost(M.throwError(new Error('error')).take(1), E.toError);

            const p = S.runCollect(s);

            const r = await T.runPromiseExit(p);

            assert.deepStrictEqual(r, Ex.fail(new Error('error')));
        });

    });

    describe('toMost', () => {

        it('should encase effect-ts stream - sync finite', async () => {
            const s = S.fromArray(A.range(0, 9));
            const o = toMost(s);

            const r = await T.runPromise(o);

            const a = [];
            const errors: unknown[] = [];

            r.forEach((n) => a.push(n))
                .catch((err) => errors.push(err));

            await T.runPromise(T.delay(20)(T.unit));

            assert.deepStrictEqual(a, A.range(0, 9));
            assert.deepStrictEqual(errors, []);
        });

        it('should encase effect-ts stream - error', async () => {
            const s = S.fail(new Error('error'));
            const o = toMost(s);

            const r = await T.runPromise(o);

            const a = [];
            const errors: unknown[] = [];

            r.forEach((n) => a.push(n))
                .catch((err) => errors.push(err));

            await T.runPromise(T.delay(10)(T.unit));

            assert.deepStrictEqual(errors, [new Error('error')]);
        });

    });

});
