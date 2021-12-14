import { TimeStamps } from "models/schemas/abstraction/time-stamps";
import { SchemaViewModel } from "./abstraction/schema.view-model";
import { CardViewModel } from "./card.view-model";

export interface CardAccessViewModel extends SchemaViewModel, TimeStamps {
    card: CardViewModel;
    ip: string;
    count: number;
}