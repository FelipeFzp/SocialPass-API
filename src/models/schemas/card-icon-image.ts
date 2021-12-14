import { CardIconImageViewModel as CardIconImageViewModel } from "models/view-models/card-icon-image.view-model";
import { Document, model, Schema } from "mongoose";
import { ToViewModel } from "./abstraction/to-view-model";

export interface ICardIconImage extends Document, ToViewModel<ICardIconImage, CardIconImageViewModel> {
    source: string;
    backgroundColor: string;
    path: string;
}

export const CardIconImageSchema: Schema = new Schema({
    source: { type: String, required: true },
    backgroundColor: { type: String, default: '#ffffff' },
    path: { type: String, required: true },
});

function toViewModel(t?: ICardIconImage): CardIconImageViewModel {
    const u: ICardIconImage = t || this;

    return {
        backgroundColor: u.backgroundColor,
        path: u.path,
        source: u.source
    }
}
CardIconImageSchema.methods.toViewModel = toViewModel;
export { toViewModel as CardIconImageToViewModel };

export const CardIconImage = model<ICardIconImage>('cardIconImageSchema', CardIconImageSchema);