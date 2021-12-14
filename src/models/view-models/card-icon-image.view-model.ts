import { SchemaViewModel } from "./abstraction/schema.view-model";

export interface CardIconImageViewModel extends SchemaViewModel {
    source: string;
    backgroundColor: string;
    path: string;
}