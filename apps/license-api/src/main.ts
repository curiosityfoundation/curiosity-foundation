import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import { MongoClient } from 'mongodb';
import * as jwt from 'express-jwt';
import * as jwtAuthz from 'express-jwt-authz';
import * as jwksRsa from 'jwks-rsa';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as winston from 'winston';

import * as Express from '@curiosity-foundation/adapter-express';
import * as Licenses from '@curiosity-foundation/feature-licenses';
import { info, LoggerLive } from '@curiosity-foundation/feature-logging';
import * as DB from '@curiosity-foundation/feature-db';

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
    Express.Route({
        name: 'index',
        path: '/licenses/unclaimed',
        method: 'get',
        handler: pipe(
            Licenses.listUnclaimedLicenses,
            T.chain(Licenses.encodeUnclaimedLicenseList),
            T.map((unclaimedLicenses) => Express.routeResponse(200)(unclaimedLicenses)),
            T.mapError(() => Express.routeError(200)({}))
        ),
        middleware: [
            cors({ origin: 'http://localhost:4200' }),
            bodyParser.json(),
            checkJwt,
        ]
    }),
    Express.Route({
        name: 'index',
        path: '/licenses/unclaimed',
        method: 'post',
        handler: Express.accessRequestContextM(({ request }) => pipe(
            request.body,
            Licenses.decodeDeviceId,
            T.chain(Licenses.insertUnclaimedLicense),
            T.map(({ doc }) => Express.routeResponse(200)({ unclaimedLicense: doc })),
            T.mapError(() => Express.routeError(200)({}))
        )),
        middleware: [
            cors({ origin: 'http://localhost:4200' }),
            bodyParser.json(),
            checkJwt,
        ],
    }),
    Express.Route({
        name: 'index',
        path: '/licenses/claimed',
        method: 'get',
        handler: pipe(
            Licenses.listClaimedLicenses,
            T.chain(Licenses.encodeClaimedLicenseList),
            T.map((claimedLicenses) => Express.routeResponse(200)(claimedLicenses)),
            T.mapError(() => Express.routeError(200)({}))
        ),
        middleware: [
            cors({ origin: 'http://localhost:4200' }),
            bodyParser.json(),
            checkJwt,
        ]
    }),
    Express.Route({
        name: 'index',
        path: '/licenses/claim',
        method: 'post',
        handler: Express.accessRequestContextM(({ request }) => pipe(
            { ...request.body, claimedBy: 'ADMIN' },
            Licenses.decodeInsertClaimedLicense,
            T.chain(Licenses.claimLicense),
            T.map(({ doc }) => Express.routeResponse(200)({ claimedLicense: doc })),
            T.mapError(() => Express.routeError(200)({}))
        )),
        middleware: [
            cors({ origin: 'http://localhost:4200' }),
            bodyParser.json(),
            checkJwt,
        ],
    }),
);

const waitProcessExit =
    (() =>
        Express.until((res) => {
            process.on("SIGINT", () => {
                res()
            })
            process.on("SIGTERM", () => {
                res()
            })
        }))()

pipe(
    Express.useMiddlewares([
        cors({ origin: 'http://localhost:4200' }),
    ]),
    T.andThen(waitProcessExit),
    T.provideSomeLayer(Router),
    T.provideSomeLayer(Licenses.LicensePersistenceLive),
    T.provideSomeLayer(Express.ExpressServerLive(Number(PORT))),
    T.provideSomeLayer(DB.MongoClientLive(new MongoClient(
        String(MONGO_CONNECTION_STRING),
        { useUnifiedTopology: true },
    ))),
    T.provideSomeLayer(LoggerLive(winston.createLogger({
        transports: [new winston.transports.Console({
            level: 'verbose',
        })],
    }))),
    T.runMain,
);
