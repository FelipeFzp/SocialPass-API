import { Document, Schema, model, Types } from 'mongoose';
import { ToViewModel } from './abstraction/to-view-model';
import { TimeStamps } from './abstraction/time-stamps';
import { CardCollectionViewModel } from '../view-models/card-collection.view-model';
import { IUser, User, UserToViewModel } from './user';
import { UserViewModel } from '../view-models/user.view-model';
import { ModelHelper } from '../../common/helpers/model.helper';

export interface ICardCollection extends Document, TimeStamps, ToViewModel<ICardCollection, CardCollectionViewModel> {
    name: string,
    user: IUser['_id'],
    cards: string[];
}

export const CardCollectionSchema: Schema = new Schema({
    name: { type: String, required: true },
    user: { type: Types.ObjectId, required: true, ref: User.modelName },
    cards: [Types.ObjectId]
}, {
    timestamps: true
});

function toViewModel(t?: ICardCollection): CardCollectionViewModel {
    const u: ICardCollection = t || this;

    return {
        id: u.id,
        name: u.name,
        user: <UserViewModel>ModelHelper.schemeToId(u.user, UserToViewModel),
        cardsIds: u.cards,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }
}
CardCollectionSchema.methods.toViewModel = toViewModel;
export { toViewModel as CardCollectionToViewModel };

export const CardCollection = model<ICardCollection>('cardCollection', CardCollectionSchema);