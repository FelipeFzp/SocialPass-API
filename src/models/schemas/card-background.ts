import { Document, model, Schema } from "mongoose";
import { FileHelper } from "../../common/helpers/file.helper";
import { CardBackgroundViewModel } from "../view-models/card-background.view-model";
import { ToViewModel } from "./abstraction/to-view-model";

export interface ICardBackground extends Document, ToViewModel<ICardBackground, CardBackgroundViewModel> {
    image?: string;
    colorRgb?: number[];
    blur?: number;
    contrastColor: string;
}

export const CardBackgroundSchema: Schema = new Schema({
    image: { type: String },
    blur: { type: Number },
    colorRgb: [{ type: Number }],
    contrastColor: { type: String, required: true }
});

function toViewModel(t?: ICardBackground): CardBackgroundViewModel {
    const u: ICardBackground = t || this;

    return {
        id: u.id,
        image: u.image,
        imageUrl: u.image ? FileHelper.getUrl(u.image, 'app') : null,
        colorRgb: u.colorRgb,
        contrastColor: u.contrastColor,
        blur: u.blur || 0
    }
}
CardBackgroundSchema.methods.toViewModel = toViewModel;
export { toViewModel as CardBackgroundToViewModel };

export const CardBackground = model<ICardBackground>('cardBackground', CardBackgroundSchema);