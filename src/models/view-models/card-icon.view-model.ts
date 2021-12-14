import { SchemaViewModel } from "./abstraction/schema.view-model";
import { CardIconImageViewModel } from "./card-icon-image.view-model";
import { SocialNetworkViewModel } from "./social-network.view-model";

export interface CardIconViewModel extends SchemaViewModel {
    key: string,
    socialNetwork: SocialNetworkViewModel;
    link: string;
    nick?: string;
    title: string;
    position: number;
    icon?: CardIconImageViewModel;
}