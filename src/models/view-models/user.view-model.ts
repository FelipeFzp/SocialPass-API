import { SchemaViewModel } from "./abstraction/schema.view-model";
import { TimeStamps } from "../schemas/abstraction/time-stamps";
import { CardViewModel } from "./card.view-model";
import { UserFollowViewModel } from "./user-follow.view-model";

export interface UserViewModel extends SchemaViewModel, TimeStamps {
    name: string;
    email: string;
    nickname: string;
    bio?: string;
    image?: string;
    imageUrl?: string;
    facebookUserId?: string;
    googleUserId?: string;
    linkedinUserId?: string;
    card: CardViewModel;
    following: UserFollowViewModel[];
}