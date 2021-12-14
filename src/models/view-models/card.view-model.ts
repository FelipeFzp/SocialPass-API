import { SchemaViewModel } from "./abstraction/schema.view-model";
import { TimeStamps } from "../schemas/abstraction/time-stamps";
import { CardIconViewModel } from "./card-icon.view-model";
import { CardBackgroundViewModel } from "./card-background.view-model";
import { CardCategoryViewModel } from "./card-category.view-model";
import { AddressViewModel } from "./address.view-model";

export interface CardViewModel extends SchemaViewModel, TimeStamps {
    background: CardBackgroundViewModel;
    icons: CardIconViewModel[];
    viewsCount: string;
    uniqueViewsCount: string;
    categories: CardCategoryViewModel[];
    address?: AddressViewModel;
}