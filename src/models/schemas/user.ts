import { Document, Schema, model, Types } from 'mongoose';
import { TimeStamps } from './abstraction/time-stamps';
import { ToViewModel } from './abstraction/to-view-model';
import { UserViewModel } from '../view-models/user.view-model';
import { FileHelper } from '../../common/helpers/file.helper';
import { Card, CardToViewModel, ICard } from './card';
import { ModelHelper } from '../../common/helpers/model.helper';
import { CardViewModel } from '../view-models/card.view-model';
import { IUserFollow, UserFollowSchema, UserFollowToViewModel } from './user-follow';

export interface IUser extends Document, TimeStamps, ToViewModel<IUser, UserViewModel> {
    name: string;
    email: string;
    nickname: string;
    bio?: string;
    password?: string;
    image?: string;
    facebookUserId?: string;
    googleUserId?: string;
    linkedinUserId?: string;
    card: ICard['_id']
    following: IUserFollow[];
}

export const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    facebookUserId: { type: String, unique: true },
    googleUserId: { type: String, unique: true },
    linkedinUserId: { type: String, unique: true },
    nickname: { type: String, required: true, unique: true },
    bio: { type: String },
    password: { type: String },
    image: { type: String },
    card: { type: Types.ObjectId, ref: Card.modelName, required: true },
    following: [UserFollowSchema]
}, {
    timestamps: true
});

function toViewModel(t?: IUser): UserViewModel {
    const u: IUser = t || this;

    return {
        id: u.id,
        name: u.name,
        email: u.email,
        nickname: u.nickname,
        bio: u.bio,
        image: u.image,
        facebookUserId: u.facebookUserId,
        googleUserId: u.googleUserId,
        linkedinUserId: u.linkedinUserId,
        imageUrl: u.image ? FileHelper.getUrl(u.image, 'app') : null,
        card: <CardViewModel>ModelHelper.schemeToId(u.card, CardToViewModel),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        following: u.following?.map(f => UserFollowToViewModel(f))
    }
}
UserSchema.methods.toViewModel = toViewModel;
export { toViewModel as UserToViewModel };

export const User = model<IUser>('user', UserSchema);