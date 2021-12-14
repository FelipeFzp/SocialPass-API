import { SchemaViewModel } from "./abstraction/schema.view-model";
import { TimeStamps } from "../schemas/abstraction/time-stamps";

export interface EmailLostPasswordViewModel extends SchemaViewModel, TimeStamps {
    code: string;
    email: string;
    expiration: Date;
    used: boolean;
}