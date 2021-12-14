import { Document, model, Schema, Types } from "mongoose";
import { AddressViewModel } from "../view-models/address.view-model";
import { ToViewModel } from "./abstraction/to-view-model";

export interface IAddress extends Document, ToViewModel<IAddress, AddressViewModel> {
    description: string;
    zipCode?: string;
    city: string;
    region: string;
    country: string;
    complement?: string;
    referencePoint?: string;
    latitude: number;
    longitude: number;
}

export const AddressSchema: Schema = new Schema({
    description: { type: String, required: true },
    zipCode: { type: String },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    complement: { type: String },
    referencePoint: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

function toViewModel(t?: IAddress): AddressViewModel {
    const a: IAddress = t || this;

    return {
        id: a.id,
        description: a.description,
        zipCode: a.zipCode,
        city: a.city,
        region: a.region,
        country: a.country,
        complement: a.complement,
        referencePoint: a.referencePoint,
        latitude: a.latitude,
        longitude: a.longitude,
    }
}
AddressSchema.methods.toViewModel = toViewModel;
export { toViewModel as AddressToViewModel };

export const Address = model<IAddress>('address', AddressSchema);		