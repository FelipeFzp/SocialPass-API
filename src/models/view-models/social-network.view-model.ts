import { SchemaViewModel } from "./abstraction/schema.view-model";

export interface SocialNetworkViewModel extends SchemaViewModel {
    key: string;
    title: string;
    placeholderPrefix?: string;
    placeholderValue: string;
    baseUrl?: string;
    imageUrl: string;
}