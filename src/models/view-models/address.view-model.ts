import { SchemaViewModel } from "./abstraction/schema.view-model";

export interface AddressViewModel extends SchemaViewModel {
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