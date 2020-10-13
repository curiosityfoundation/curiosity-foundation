import * as M from '@effect-ts/morphic';

const User_ = M.make((F) => F.interface({
    name: F.string(),
    email: F.string(),
    email_verified: F.boolean(),
    picture: F.string(),
    updatedAt: F.date(),
}, { name: 'User' }));

export interface User extends M.AType<typeof User_> { }
export interface UserRaw extends M.EType<typeof User_> { }
export const User = M.opaque<UserRaw, User>()(User_);
