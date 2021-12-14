import { injectable } from "inversify";
import { CardCategory } from "../models/schemas/card-category";
import { CardCategoryViewModel } from "../models/view-models/card-category.view-model";

@injectable()
export class CardCategoryService {

    public async listAvailableCategories(): Promise<CardCategoryViewModel[]> {

        const categories = await CardCategory.find({});

        return categories.map(c => c.toViewModel());
    }
}