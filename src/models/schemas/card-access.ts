import { CardAccessViewModel } from "models/view-models/card-access.view-model";
import { Document, model, Schema, Types } from "mongoose";
import { TimeStamps } from "./abstraction/time-stamps";
import { ToViewModel } from "./abstraction/to-view-model";
import { Card, ICard } from "./card";
import { IUser, User } from "./user";

export interface ICardAccess extends Document, TimeStamps, ToViewModel<ICardAccess, CardAccessViewModel> {
    card: ICard['_id'],
    ip: string,
    count: number,
    user: IUser['_id']
}

export const CardAccessSchema: Schema = new Schema({
    card: { type: Types.ObjectId, ref: Card.modelName, required: true },
    ip: { type: String, required: true },
    user: { type: Types.ObjectId, ref: User.modelName, required: false },
    count: { type: Number, default: 1, min: 0 }
}, {
    timestamps: true
});

export const CardAccess = model<ICardAccess>('cardAccess', CardAccessSchema);