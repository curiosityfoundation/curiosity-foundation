import * as http from 'http'

import * as connect from 'connect'
import * as Exp from 'express'

import * as T from '@effect-ts/core/Effect'
import * as A from '@effect-ts/core/Classic/Array'
import * as O from '@effect-ts/core/Classic/Option'
import * as Ex from '@effect-ts/core/Effect/Exit'
import * as C from '@effect-ts/core/Effect/Cause'
import { pipe } from '@effect-ts/core/Function'
import * as L from '@effect-ts/core/Effect/Layer'
import * as M from '@effect-ts/core/Effect/Managed'
import { tag, Has } from '@effect-ts/core/Has'

import { info, Logger, verbose } from '@curiosity-foundation/feature-logging';

export type Method = 'post' | 'get' | 'put' | 'patch' | 'delete'

export interface RouteError<E> {
    status: number
    body: E
}

export interface RouteResponse<A> {
    status: number
    body: A
}

//
// @category api
//

export function routeError(status: number) {
    return <E>(body: E): RouteError<E> => ({
        status,
        body
    })
}

export function routeResponse(status: number) {
    return <A>(body: A): RouteResponse<A> => ({
        status,
        body
    })
}

interface RequestContext {
    request: Exp.Request;
};

const RequestContext = tag<RequestContext>();

export const accessRequestContext = T.accessService(RequestContext);
export const accessRequestContextM = T.accessServiceM(RequestContext);

export const on = <R = unknown, E = never, A = unknown>(
    method: Method,
    path: string,
    f: T.Effect<Has<RequestContext> & Has<Logger> & R, RouteError<E>, RouteResponse<A>>,
    ...rest: connect.NextHandleFunction[]
): T.Effect<Has<ExpressServer> & Has<Logger> & R, never, void> =>
    accessExpressServerM(({ express }) =>
        T.access((r: R & Has<Logger>) => {
            express[method](path, ...(rest.length === 0 ? [Exp.json()] : rest), (req, res) => {
                T.run(
                    pipe(
                        verbose(`${method.toUpperCase()} ${path}`),
                        T.andThen(f),
                        T.provideSomeLayer(L.fromConstructor(RequestContext)(() => ({
                            request: req
                        }))()),
                        T.provide(r),
                    ),
                    Ex.fold(
                        C.fold(
                            () => {
                                // empty
                                res.status(500).send({
                                    status: 'empty',
                                })
                            },
                            (x) => {
                                // fail
                                res.status(500).send({
                                    status: 'failed',
                                })
                            },
                            () => {
                                // die
                                res.status(500).send({
                                    status: 'died',
                                })
                            },
                            () => {
                                // interrupt
                                res.status(500).send({
                                    status: 'interrupted'
                                })
                            },
                            () => {
                                // then
                                res.status(500).send({
                                    status: 'then',
                                })
                            },
                            () => {
                                // both
                                res.status(500).send({
                                    status: 'both',
                                })
                            },
                        ),
                        (x) => {
                            // success
                            res.status(x.status).send(x.body)
                        },
                    )
                )
            })
        })
    )

interface ExpressRoute<K> { };

const ExpressRoute = <K extends string>(k: K) => tag<ExpressRoute<K>>();

type RouteObj<K extends string, R = unknown, E = never, A = unknown> = {
    name: K,
    method: Method;
    path: string;
    handler: T.Effect<R & Has<RequestContext> & Has<Logger>, RouteError<E>, RouteResponse<A>>;
    middleware?: connect.NextHandleFunction[];
};

export const Route = <K extends string, R = unknown, E = never, A = unknown>({
    name,
    method,
    path,
    handler,
    middleware = [],
}: RouteObj<K, R, E, A>) =>
    L.fromEffect(ExpressRoute(name))(T.map_(on(
        method,
        path,
        handler,
        ...middleware
    ), () => ({})))

//
// @category implementation
//

export interface ExpressConfig {
    port: number
    hostname?: string
}

export interface BindError {
    _tag: 'BindError'
    error: Error
}

export interface CloseError {
    _tag: 'CloseError'
    error: Error
}

export interface ExpressServer {
    express: Exp.Express;
    server: http.Server;
}

export const useMiddleware = (middleware: connect.NextHandleFunction) =>
    accessExpressServerM(({ express }) =>
        T.effectTotal(() => {
            express.use(middleware);
        }));

export const useMiddlewares = (middlewares: connect.NextHandleFunction[]) =>
    accessExpressServerM(({ express }) => pipe(
        middlewares,
        A.map((middleware) => T.effectTotal(() => {
            express.use(middleware);
        })),
        T.collectAllPar,
        T.asUnit,
    ));

const ExpressServer = tag<ExpressServer>();

const managedExpress = ({ hostname = '0.0.0.0', port }: ExpressConfig) =>
    M.makeInterruptible(
        // release
        // TODO: catch close errors
        ({ server }: { express: Exp.Express; server: http.Server }) =>
            pipe(
                T.effectAsync<unknown, never, void>((resolve) => {
                    server.close((err) => {
                        resolve(T.succeed(undefined))
                    })
                }),
                T.tap(() => info(`closed express server on ${hostname}:${port}`))
            ),
    )(pipe(
        T.effectAsync<unknown, ExpressError, { express: Exp.Express; server: http.Server }>(
            // acquire
            // TODO: catch bind errors
            (resolve) => {
                const express = Exp();
                const server = express.listen(port, hostname, () => {
                    resolve(
                        T.succeed({
                            server,
                            express,
                        })
                    );
                })
            }
        ),
        T.tap(() => info(`express server listening on ${hostname}:${port}`))
    ));

export type ExpressError = BindError | CloseError

export const ExpressServerLive = (
    port: number,
    hostname?: string
) =>
    pipe(
        { port, hostname },
        managedExpress,
        L.fromManaged(ExpressServer),
    )

export const accessExpressServer = T.accessService(ExpressServer);
export const accessExpressServerM = T.accessServiceM(ExpressServer);

export const until = (f: (res: () => void) => void) =>
    T.effectAsync((res) => {
        const handle = setInterval(() => {
            // keep process going
        }, 60000)
        f(() => {
            res(T.fail(O.none))
            clearInterval(handle)
        })
        return (cb) => {
            clearInterval(handle)
            cb()
        }
    });