import { Document, Types } from "mongoose";
import { SchemaViewModel } from "../../models/view-models/abstraction/schema.view-model";

export abstract class ModelHelper {

    public static schemeToId(
        scheme: Document | Types.ObjectId | string | number,
        toViewModelFunc: (m: Document) => SchemaViewModel
    ): SchemaViewModel {

        if (!scheme)
            return null;

        if (Types.ObjectId.isValid(<Types.ObjectId | string | number>scheme)) {
            return {
                id: <string>scheme
            }
        } else {
            return toViewModelFunc(<Document>scheme);
        }
    }
}