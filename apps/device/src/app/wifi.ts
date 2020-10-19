import * as T from '@effect-ts/core/Effect';
import * as S from '@effect-ts/core/Effect/Stream';
import { pipe } from '@effect-ts/core/Function';
import * as O from '@effect-ts/core/Classic/Option';
import * as M from '@effect-ts/morphic';
import { spawn } from 'child_process';

import { info, warn } from '@curiosity-foundation/feature-logging';

const StdOut_ = M.make((F) => F.interface({
    type: F.stringLiteral('StdOut'),
    data: F.unknown(),
}, { name: 'StdOut' }));

interface StdOut extends M.AType<typeof StdOut_> { }
interface StdOutRaw extends M.EType<typeof StdOut_> { }
const StdOut = M.opaque<StdOutRaw, StdOut>()(StdOut_);

const StdErr_ = M.make((F) => F.interface({
    type: F.stringLiteral('StdErr'),
    data: F.unknown(),
}, { name: 'StdErr' }));

interface StdErr extends M.AType<typeof StdErr_> { }
interface StdErrRaw extends M.EType<typeof StdErr_> { }
const StdErr = M.opaque<StdErrRaw, StdErr>()(StdErr_);

const ProcessOutput = M.makeADT('type')({
    StdErr,
    StdOut,
});

type ProcessOutput = M.AType<typeof ProcessOutput>;

const runProcess = (command: string, args: string[]) =>
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

export const checkWifiAndConnectIfNotConnected = pipe(
    info('checking wifi connection'),
    T.andThen(pipe(
        runProcess('iwgetid', ['-r']),
        S.runDrain,
    )),
    T.andThen(info('a wifi connection exists')),
    T.orElse(() => pipe(
        info('a wifi connection does not exist, starting wifi connect'),
        T.andThen(pipe(
            runProcess(`${process.cwd()}/wifi-connect`, []),
            S.runDrain,
        )),
        T.orElse(() => warn('wifi connect exited with a non-zero error code')),
    )),
);
