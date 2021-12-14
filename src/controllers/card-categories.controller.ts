import { Request, Response, NextFunction, Router } from "express";
import { CardCategoryViewModel } from "../models/view-models/card-category.view-model";
import { ServicesCollection } from "../providers";
import { CardCategoryService } from "../services/card-category.service";

const CardCategoriesController = Router();

const cardCategoryService = ServicesCollection.resolve(CardCategoryService);

CardCategoriesController.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await cardCategoryService.listAvailableCategories()

        const parentCategories: { id: string, name: string, childs: CardCategoryViewModel[] }[] = []
        for (const parentCategory of categories.filter(c => !c.parent)) {
            parentCategories.push({
                id: parentCategory.id,
                name: parentCategory.name,
                childs: categories.filter(c => c.parent?.id == parentCategory.id)
            })
        }
        res.json(parentCategories);
    } catch (error) {
        next(error);
    }
});

export { CardCategoriesController };