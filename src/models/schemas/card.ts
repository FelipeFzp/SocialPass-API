import { Document, Schema, model, Types } from 'mongoose';
import { ToViewModel } from './abstraction/to-view-model';
import { CardBackgroundSchema, CardBackgroundToViewModel, ICardBackground } from './card-background';
import { CardIconSchema, CardIconToViewModel, ICardIcon } from './card-icon';
import { TimeStamps } from './abstraction/time-stamps';
import { CardViewModel } from '../view-models/card.view-model';
import { ModelHelper } from '../../common/helpers/model.helper';
import { CardBackgroundViewModel } from '../view-models/card-background.view-model';
import { CardIconViewModel } from '../view-models/card-icon.view-model';
import { CardCategory, CardCategoryToViewModel, ICardCategory } from './card-category';
import { CardCategoryViewModel } from 'models/view-models/card-category.view-model';
import { Address, AddressToViewModel, IAddress } from './address';
import { AddressViewModel } from '../view-models/address.view-model';

export interface ICard extends Document, TimeStamps, ToViewModel<ICard, CardViewModel> {
    background: ICardBackground;
    icons: ICardIcon[];
    viewsCount: number;
    uniqueViewsCount: number;
    categories: ICardCategory['_id'][];
    address: IAddress['_id']
}

export const CardSchema: Schema = new Schema({
    background: CardBackgroundSchema,
    icons: [CardIconSchema],
    categories: [{ type: Types.ObjectId, ref: CardCategory.modelName }],
    viewsCount: {
        default: 0,
        type: Number
    },
    uniqueViewsCount: {
        default: 0,
        type: Number
    },
    address: { type: Types.ObjectId, ref: Address.modelName }
}, {
    timestamps: true
});

function toViewModel(t?: ICard): CardViewModel {
    const u: ICard = t || this;

    let NumAbbr = require('number-abbreviate');

    return {
        id: u.id,
        background: <CardBackgroundViewModel>ModelHelper.schemeToId(u.background, CardBackgroundToViewModel),
        icons: u.icons.map(ic => <CardIconViewModel>ModelHelper.schemeToId(ic, CardIconToViewModel)),
        categories: u.categories.map(cc => <CardCategoryViewModel>ModelHelper.schemeToId(cc, CardCategoryToViewModel)),
        viewsCount: new NumAbbr().abbreviate(u.viewsCount, 1),
        uniqueViewsCount: new NumAbbr().abbreviate(u.uniqueViewsCount, 1),
        address: <AddressViewModel>ModelHelper.schemeToId(u.address, AddressToViewModel),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }
}
CardSchema.methods.toViewModel = toViewModel;
export { toViewModel as CardToViewModel };

export const Card = model<ICard>('card', CardSchema);