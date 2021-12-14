import { UserViewModel } from "./user.view-model";

export interface TrendsHomeCategoriesViewModel {
    topWeek: UserViewModel[];
    likeYou: UserViewModel[];
    likeYourFollows: UserViewModel[];
    recent: UserViewModel[];
    nearToYou: UserViewModel[];
}