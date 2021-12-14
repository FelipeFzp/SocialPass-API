import { SchemaViewModel } from "./abstraction/schema.view-model";
import { TimeStamps } from "../schemas/abstraction/time-stamps";
import { UserViewModel } from "./user.view-model";

export interface CardCollectionViewModel extends SchemaViewModel, TimeStamps {
    name: string;
    user: UserViewModel;
    cardsIds: string[];
    cards?: {
        name: string,
        bio: string,
        nickname: string,
        imageUrl: string
    }[];
}