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
import { has, Has } from '@effect-ts/core/Classic/Has'

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

// export const accessApp = <A>(f: (_: Exp.Express) => A) =>
//     T.accessService(ExpressServer)((_: Express) => T.map_(_[ExpressURI].accessApp, f))

// export const accessAppM = <R, E, A>(f: (app: Exp.Express) => T.Effect<R, E, A>) =>
//     T.chain_(accessApp(identity), f)

// export const accessServer = <A>(f: (_: http.Server) => A) =>
//     T.accessM((_: Express) => T.map_(_[ExpressURI].accessServer, f))

// export const accessServerM = <R, E, A>(
//     f: (_: http.Server) => T.Effect<R, E, A>
// ) => T.accessM((_: Express) => T.chain_(accessServer(identity), f))

// export const accessReq = <A>(f: (req: Exp.Request) => A) =>
//     T.access(({ [RequestContextURI]: { request } }: RequestContext) => f(request))

// export const accessReqM = <R, E, A>(f: (req: Exp.Request) => T.Effect<R, E, A>) =>
//     T.chain_(accessReq(identity), f)

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

const RequestContext = has<RequestContext>();

export const on = <R = unknown, E = never, A = unknown>(
    method: Method,
    path: string,
    f: T.Effect<R, RouteError<E>, RouteResponse<A>>,
    ...rest: connect.NextHandleFunction[]
): T.Effect<Has<ExpressServer> & R, never, void> =>
    accessExpressServerM(({ express }) =>
        T.access((r: R) => {
            express[method](path, ...(rest.length === 0 ? [Exp.json()] : rest), (req, res) => {
                T.run(
                    pipe(
                        f,
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

const ExpressRoute = <K extends string>(k: K) => has<ExpressRoute<K>>();

type RouteObj<K extends string, R = unknown, E = never, A = unknown> = {
    name: K,
    method: Method;
    path: string;
    handler: T.Effect<R, RouteError<E>, RouteResponse<A>>;
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

const ExpressServer = has<ExpressServer>();

const managedExpress = ({ hostname, port }: ExpressConfig) =>
    M.makeInterruptible(
        // release
        // TODO: catch close errors
        ({ server }: { express: Exp.Express; server: http.Server }) =>
            T.effectAsync<unknown, never, void>((resolve) => {
                server.close((err) => {
                    resolve(T.succeed(undefined))
                })
            })
    )(T.effectAsync<unknown, ExpressError, { express: Exp.Express; server: http.Server }>(
        // acquire
        // TODO: catch bind errors
        (resolve) => {
            const express = Exp();
            const server = express.listen(port, hostname || '0.0.0.0', () => {
                console.log('express listening at', port);
                resolve(
                    T.succeed({
                        server,
                        express,
                    })
                );
            })
        }
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