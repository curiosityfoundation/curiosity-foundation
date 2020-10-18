import * as T from '@effect-ts/core/Effect';
import * as O from '@effect-ts/core/Classic/Option';
import * as L from '@effect-ts/core/Effect/Layer';
import * as Schedule from '@effect-ts/core/Effect/Schedule';
import { pipe } from '@effect-ts/core/Function';
import * as express from 'express';
import * as jwt from 'express-jwt';
import * as jwtAuthz from 'express-jwt-authz';
import * as jwksRsa from 'jwks-rsa';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as Licenses from '@curiosity-foundation/feature-licenses';
import * as DB from '@curiosity-foundation/feature-db';
import * as Server from '@curiosity-foundation/feature-http-server';

const { AUTH0_DOMAIN, PORT, AUTH0_AUDIENCE, MONGO_CONNECTION_STRING } = process.env;

const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
    getToken: (req) => req.headers.authorization,
});

const Router = L.all(
    Server.Route({
        name: 'index',
        path: '/',
        method: 'get',
        handler: pipe(
            Licenses.listUnclaimedLicenses,
            T.map((result) => Server.routeResponse(200)({ result })),
            T.mapError(() => Server.routeError(200)({}))
        ),
    }),
    Server.Route({
        name: 'auth',
        path: '/auth',
        method: 'get',
        handler: pipe(
            Licenses.listUnclaimedLicenses,
            T.map((result) => Server.routeResponse(200)({ result })),
            T.mapError(() => Server.routeError(200)({}))
        ),
        middleware: [
            checkJwt,
            jwtAuthz(['read:licenses']),
        ],
    }),
);

const waitProcessExit =
    (() =>
        Server.until((res) => {
            process.on("SIGINT", () => {
                res()
            })
            process.on("SIGTERM", () => {
                res()
            })
        }))()

pipe(
    Server.useMiddlewares([
        cors(),
        bodyParser.json(),
        bodyParser.urlencoded({
            extended: true
        })
    ]),
    T.andThen(waitProcessExit),
    T.provideSomeLayer(Router),
    T.provideSomeLayer(Licenses.LicensePersistenceLive),
    T.provideSomeLayer(Server.ExpressServerLive(Number(PORT))),
    T.provideSomeLayer(DB.MongoClientLive(String(MONGO_CONNECTION_STRING))),
    T.runMain,
);
