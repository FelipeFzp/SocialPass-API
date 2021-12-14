import { Request, Response, NextFunction, Router } from "express";
import { TokenHelper } from "../common/helpers/token.helper";
import { checkToken } from "../middlewares/check-token";
import { ServicesCollection } from "../providers";
import { CardCollectionService } from "../services/card-collection.service";

const CardCollectionsController = Router();

const cardCollectionService = ServicesCollection.resolve(CardCollectionService);

CardCollectionsController.get('/withCards', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collection = await cardCollectionService.getCollectionsWithCards(TokenHelper.getPayload(res).userId)
        res.json(collection);
    } catch (error) {
        next(error);
    }
});

CardCollectionsController.get('/available', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collection = await cardCollectionService.getAvailableCollections(TokenHelper.getPayload(res).userId)
        res.json(collection);
    } catch (error) {
        next(error);
    }
});

CardCollectionsController.post('', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collection = await cardCollectionService.createCollection(req.body.collection, TokenHelper.getPayload(res).userId)
        res.json(collection);
    } catch (error) {
        next(error);
    }
});

CardCollectionsController.delete('/:collectionId', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await cardCollectionService.deleteCollection(req.params.collectionId, TokenHelper.getPayload(res).userId)
        res.json();
    } catch (error) {
        next(error);
    }
});

CardCollectionsController.patch('/:collectionId/card/:cardId', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await cardCollectionService.toggleCardIntoCollection(req.params.collectionId, req.params.cardId, TokenHelper.getPayload(res).userId)
        res.json();
    } catch (error) {
        next(error);
    }
});

export { CardCollectionsController };