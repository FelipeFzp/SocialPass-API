import { IUser } from "../schemas/user";
import { SchemaViewModel } from "./abstraction/schema.view-model";

export interface UserFollowViewModel extends SchemaViewModel {
    user: IUser['_id'];
    followedAt: Date;
}