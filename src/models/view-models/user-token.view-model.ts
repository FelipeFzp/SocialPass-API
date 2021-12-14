import { UserViewModel } from "./user.view-model";

export interface UserTokenViewModel {
    user: UserViewModel;
    token: string;
}