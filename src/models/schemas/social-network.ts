import { Document, model, Schema } from "mongoose";
import { FileHelper } from "../../common/helpers/file.helper";
import { SocialNetworkViewModel } from "../view-models/social-network.view-model";
import { ToViewModel } from "./abstraction/to-view-model";

export const SOCIAL_NETWORK_IMAGE_TYPE = 'png';

export interface ISocialNetwork extends Document, ToViewModel<ISocialNetwork, SocialNetworkViewModel> {
    key: string;
    title: string;
    placeholderPrefix?: string;
    placeholderValue: string;
    baseUrl?: string;
}

export const SocialNetworkSchema: Schema = new Schema({
    key: { type: String, required: true },
    title: { type: String, required: true },
    placeholderPrefix: { type: String, required: false },
    placeholderValue: { type: String, required: true },
    baseUrl: { type: String }
});

function toViewModel(t?: ISocialNetwork): SocialNetworkViewModel {
    const u: ISocialNetwork = t || this;

    return {
        id: u.id,
        key: u.key,
        title: u.title,
        baseUrl: u.baseUrl,
        placeholderPrefix: u.placeholderPrefix,
        placeholderValue: u.placeholderValue,
        imageUrl: FileHelper.getUrl(`social-icons/${u.key}.${SOCIAL_NETWORK_IMAGE_TYPE}`, 'static')
    }
}
SocialNetworkSchema.methods.toViewModel = toViewModel;
export { toViewModel as SocialNetworkToViewModel };

export const SocialNetwork = model<ISocialNetwork>('socialNetwork', SocialNetworkSchema);