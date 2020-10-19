import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as M from '@effect-ts/morphic';
import { spawn } from 'child_process';

const StdOut_ = M.make((F) => F.interface({
    type: F.stringLiteral('StdOut'),
    data: F.unknown(),
}, { name: 'StdOut' }));

export interface StdOut extends M.AType<typeof StdOut_> { }
export interface StdOutRaw extends M.EType<typeof StdOut_> { }
export const StdOut = M.opaque<StdOutRaw, StdOut>()(StdOut_);

const StdErr_ = M.make((F) => F.interface({
    type: F.stringLiteral('StdErr'),
    data: F.unknown(),
}, { name: 'StdErr' }));

export interface StdErr extends M.AType<typeof StdErr_> { }
export interface StdErrRaw extends M.EType<typeof StdErr_> { }
export const StdErr = M.opaque<StdErrRaw, StdErr>()(StdErr_);

export const ProcessOutput = M.makeADT('type')({
    StdErr,
    StdOut,
});

export type ProcessOutput = M.AType<typeof ProcessOutput>;

export const runProcess = (command: string, args: string[]) =>
    S.effectAsync<{}, number, ProcessOutput>((cb) => {

        const proc = spawn(command, args);

        proc.stdout.on('data', (data) => pipe(
            [ProcessOutput.of.StdOut({ data })],
            T.succeed,
            cb,
        ));

        proc.stderr.on('data', (data) => pipe(
            [ProcessOutput.of.StdErr({ data })],
            T.succeed,
            cb,
        ));

        proc.on('close', (code) => pipe(
            Number(code) === 0
                ? T.fail(O.none)
                : T.fail(O.some(Number(code))),
            cb,
        ));

    });
