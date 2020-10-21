import { has } from '@effect-ts/core/Classic/Has';
import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import { nanoid } from 'nanoid';

import { accessMongoClientM } from '@curiosity-foundation/feature-db';

import {
    encodeUnclaimedLicense,
    encodeClaimedLicense,
    DeviceId,
    InsertClaimedLicense,
    decodeUnclaimedLicenseList,
    decodeClaimedLicenseList,
} from './model';

const makeLicensePersistence = () => ({
    insertUnclaimedLicense: ({ deviceId }: DeviceId) => pipe(
        T.do,
        T.bind('doc', () => encodeUnclaimedLicense({
            deviceId,
            _id: nanoid(),
            created: new Date(),
            modified: O.none,
        })),
        T.bind('inserted', ({ doc }) =>
            accessMongoClientM(({ client }) =>
                T.fromPromise(() => client.db('test')
                    .collection('unclaimedLicenses')
                    .insertOne(doc))
            ),
        ),
    ),
    listUnclaimedLicenses: pipe(
        accessMongoClientM(({ client }) =>
            T.fromPromise(() => client.db('test')
                .collection('unclaimedLicenses')
                .find({})
                .toArray())
        ),
        T.chain((unclaimedLicenses) => pipe(
            { unclaimedLicenses },
            decodeUnclaimedLicenseList,
        )),
    ),
    listClaimedLicenses: pipe(
        accessMongoClientM(({ client }) =>
            T.fromPromise(() => client.db('test')
                .collection('claimedLicenses')
                .find({})
                .toArray())
        ),
        T.chain((claimedLicenses) => pipe(
            { claimedLicenses },
            decodeClaimedLicenseList,
        )),
    ),
    // check found is not undef before proceeding
    claimLicense: ({ deviceId, claimedBy }: InsertClaimedLicense) => pipe(
        T.do,
        T.bind('found', () => accessMongoClientM(
            ({ client }) => T.fromPromise(() =>
                client.db('test')
                    .collection('unclaimedLicenses')
                    .findOne({ deviceId })),
        )),
        T.bind('doc', () => encodeClaimedLicense({
            claimedBy,
            deviceId,
            _id: nanoid(),
            created: new Date(),
            modified: O.none,
        })),
        T.bind('inserted', ({ doc }) =>
            accessMongoClientM(({ client }) =>
                T.fromPromise(() => client.db('test')
                    .collection('claimedLicenses')
                    .insertOne(doc)),
            ),
        ),
        T.bind('removed', ({ found }) =>
            accessMongoClientM(({ client }) =>
                T.fromPromise(() => client.db('test')
                    .collection('claimedLicenses')
                    .deleteOne(found._id)),
            ),
        ),
    ),
});

export interface LicensePersistence
    extends ReturnType<typeof makeLicensePersistence> { }

export const LicensePersistence = has<LicensePersistence>()

export const LicensePersistenceLive = L.fromConstructor(LicensePersistence)(
    makeLicensePersistence
)()

export const { 
    claimLicense, 
    insertUnclaimedLicense, 
    listUnclaimedLicenses, 
    listClaimedLicenses, 
} = T.deriveLifted(
    LicensePersistence
)(['claimLicense', 'insertUnclaimedLicense'], ['listUnclaimedLicenses', 'listClaimedLicenses'], [] as never[])