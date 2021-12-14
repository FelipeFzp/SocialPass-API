import { TimeStamps } from "models/schemas/abstraction/time-stamps";
import { SchemaViewModel } from "./abstraction/schema.view-model";

export interface CardCategoryViewModel extends SchemaViewModel {
    name: string,
    parent: CardCategoryViewModel,
}