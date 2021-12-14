import { CardAccessViewModel } from "models/view-models/card-access.view-model";
import { CardCategoryViewModel } from "models/view-models/card-category.view-model";
import { Document, model, Schema, Types } from "mongoose";
import { ToViewModel } from "./abstraction/to-view-model";
import { ModelHelper } from '../../common/helpers/model.helper';
import { ICard } from "./card";

export interface ICardCategory extends Document, ToViewModel<ICardCategory, CardCategoryViewModel> {
    name: string,
    parent: ICardCategory['_id'],
}

export const CardCategorySchema: Schema = new Schema({
    name: { type: String, required: true },
    parent: { type: Types.ObjectId, ref: 'cardCategory', required: false },
});

function toViewModel(t?: ICardCategory): CardCategoryViewModel {
    const c: ICardCategory = t || this;

    return {
        id: c.id,
        name: c.name,
        parent: <CardCategoryViewModel>ModelHelper.schemeToId(c.parent, toViewModel)
    }
}
CardCategorySchema.methods.toViewModel = toViewModel;
export { toViewModel as CardCategoryToViewModel };

export const CardCategory = model<ICardCategory>('cardCategory', CardCategorySchema);