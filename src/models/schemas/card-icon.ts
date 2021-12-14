import { Document, model, Schema, Types } from "mongoose";
import { ModelHelper } from "../../common/helpers/model.helper";
import { CardIconViewModel } from "../view-models/card-icon.view-model";
import { SocialNetworkViewModel } from "../view-models/social-network.view-model";
import { ToViewModel } from "./abstraction/to-view-model";
import { ISocialNetwork, SocialNetwork, SocialNetworkSchema, SocialNetworkToViewModel } from "./social-network";
import { ICardIconImage, CardIconImage, CardIconImageSchema } from "./card-icon-image";

export interface ICardIcon extends Document, ToViewModel<ICardIcon, CardIconViewModel> {
    key: string,
    socialNetwork: ISocialNetwork['_id'];
    link: string;
    nick?: string;
    title?: string;
    position: number;
    icon?: ICardIconImage;
}

export const CardIconSchema: Schema = new Schema({
    key: { type: String, required: true },
    socialNetwork: { type: Types.ObjectId, ref: SocialNetwork.modelName, required: true },
    link: { type: String, required: true },
    nick: { type: String },
    title: { type: String },
    icon: CardIconImageSchema,
    position: { type: Number, required: true }
});

function toViewModel(t?: ICardIcon): CardIconViewModel {
    const u: ICardIcon = t || this;

    return {
        key: u.key,
        socialNetwork: <SocialNetworkViewModel>ModelHelper.schemeToId(u.socialNetwork, SocialNetworkToViewModel),
        link: u.link,
        nick: u.nick,
        title: u.title,
        position: u.position,
        icon: u.icon?.toViewModel()
    }
}
CardIconSchema.methods.toViewModel = toViewModel;
export { toViewModel as CardIconToViewModel };

export const CardIcon = model<ICardIcon>('cardIcon', CardIconSchema);