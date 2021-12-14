import { SchemaViewModel } from "./abstraction/schema.view-model";

export interface CardBackgroundViewModel extends SchemaViewModel {
    image?: string;
    imageUrl?: string;
    colorRgb?: number[];
    blur?: number;
    contrastColor: string;
}