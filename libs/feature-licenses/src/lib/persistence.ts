import { tag } from '@effect-ts/core/Has';
import * as O from '@effect-ts/core/Classic/Option';
import * as T from '@effect-ts/core/Effect';
import * as L from '@effect-ts/core/Effect/Layer';
import { pipe } from '@effect-ts/core/Function';
import { nanoid } from 'nanoid';

import { accessMongoClientM } from '@curiosity-foundation/feature-db';
import { verbose } from '@curiosity-foundation/feature-logging';

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
        T.tap(() => verbose('encoding unclaimed license')),
        T.bind('doc', () => encodeUnclaimedLicense({
            deviceId,
            _id: nanoid(),
            created: new Date(),
            modified: O.none,
        })),
        T.tap(() => verbose('inserting unclaimed license')),
        T.bind('inserted', ({ doc }) =>
            accessMongoClientM(({ client }) =>
                T.fromPromise(() => client.db('test')
                    .collection('unclaimedLicenses')
                    .insertOne(doc))
            ),
        ),
        T.tap(() => verbose('unclaimed license inserted')),
    ),
    listUnclaimedLicenses: pipe(
        verbose('finding unclaimed licenses'),
        T.andThen(accessMongoClientM(({ client }) =>
            T.fromPromise(() => client.db('test')
                .collection('unclaimedLicenses')
                .find({})
                .toArray())
        )),
        T.tap(() => verbose('decoding unclaimed licenses')),
        T.chain((unclaimedLicenses) => pipe(
            { unclaimedLicenses },
            decodeUnclaimedLicenseList,
        )),
        T.tap(() => verbose('unclaimed licenses decoded')),
    ),
    listClaimedLicenses: pipe(
        verbose('finding claimed licenses'),
        T.andThen(accessMongoClientM(({ client }) =>
            T.fromPromise(() => client.db('test')
                .collection('claimedLicenses')
                .find({})
                .toArray())
        )),
        T.tap(() => verbose('decoding claimed licenses')),
        T.chain((claimedLicenses) => pipe(
            { claimedLicenses },
            decodeClaimedLicenseList,
        )),
        T.tap(() => verbose('claimed licenses decoded')),
    ),
    // check found is not undef before proceeding
    claimLicense: ({ deviceId, claimedBy }: InsertClaimedLicense) => pipe(
        T.do,
        T.tap(() => verbose('finding unclaimed license')),
        T.bind('found', () => accessMongoClientM(
            ({ client }) => T.fromPromise(() =>
                client.db('test')
                    .collection('unclaimedLicenses')
                    .findOne({ deviceId })),
        )),
        T.tap(() => verbose('encoding claimed license')),
        T.bind('doc', () => encodeClaimedLicense({
            claimedBy,
            deviceId,
            _id: nanoid(),
            created: new Date(),
            modified: O.none,
        })),
        T.tap(() => verbose('inserting claimed license')),
        T.bind('inserted', ({ doc }) =>
            accessMongoClientM(({ client }) =>
                T.fromPromise(() => client.db('test')
                    .collection('claimedLicenses')
                    .insertOne(doc)),
            ),
        ),
        T.tap(() => verbose('removing unclaimed license')),
        T.bind('removed', ({ found }) =>
            accessMongoClientM(({ client }) =>
                T.fromPromise(() => client.db('test')
                    .collection('claimedLicenses')
                    .deleteOne({ _id: found._id })),
            ),
        ),
        T.tap(() => verbose('claimed license inserted and unclaimed license removed')),
    ),
});

export interface LicensePersistence
    extends ReturnType<typeof makeLicensePersistence> { }

export const LicensePersistence = tag<LicensePersistence>()

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