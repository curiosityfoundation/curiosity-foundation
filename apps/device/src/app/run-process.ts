import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import { ADTType, ofType, makeADT } from '@morphic-ts/adt';
import * as O from 'fp-ts/Option';
import { spawn } from 'child_process';

type StdOut = {
    _tag: 'stdout';
    data: unknown;
};

type StdErr = {
    _tag: 'stderr';
    data: unknown;
};

export const ProcessOutput = makeADT('_tag')({
    stderr: ofType<StdErr>(),
    stdout: ofType<StdOut>(),
});

export type ProcessOutput = ADTType<typeof ProcessOutput>;

export const runProcess = (command: string, args: string[]) =>
    S.effectAsync<{}, number, ProcessOutput>((cb) => {

        const proc = spawn(command, args);

        proc.stdout.on('data', (data) => pipe(
            [ProcessOutput.of.stdout({ data })],
            T.succeed,
            cb,
        ));

        proc.stderr.on('data', (data) => pipe(
            [ProcessOutput.of.stderr({ data })],
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
