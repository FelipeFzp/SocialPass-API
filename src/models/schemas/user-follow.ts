import { Document, model, Schema, Types } from "mongoose";
import { ModelHelper } from "../../common/helpers/model.helper";
import { ToViewModel } from "./abstraction/to-view-model";
import { UserFollowViewModel } from "../view-models/user-follow.view-model";
import { IUser, User, UserToViewModel } from "./user";
import { UserViewModel } from "../view-models/user.view-model";

export interface IUserFollow extends Document, ToViewModel<IUserFollow, UserFollowViewModel> {
    followedAt: Date,
    user: string
}

export const UserFollowSchema: Schema = new Schema({
    followedAt: { type: Date, default: Date.now() },
    user: { type: Types.ObjectId, required: true },
});

function toViewModel(t?: IUserFollow): UserFollowViewModel {
    const u: IUserFollow = t || this;

    return {
        id: u.id,
        user: u.user,
        followedAt: u.followedAt
    }
}

UserFollowSchema.methods.toViewModel = toViewModel;
export { toViewModel as UserFollowToViewModel };

export const UserFollow = model<IUserFollow>('userFollow', UserFollowSchema);