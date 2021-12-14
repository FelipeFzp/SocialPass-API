import { Request, Response, NextFunction, Router } from "express";
import { TokenHelper } from "../common/helpers/token.helper";
import { checkToken } from "../middlewares/check-token";
import { ServicesCollection } from "../providers";
import { TrendsService } from "../services/trends.service";

const TrendsController = Router();

const trendsService = ServicesCollection.resolve(TrendsService);

TrendsController.post('/search/:page/:limit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchTerms: string[] = req.body.terms;
        const { page, limit } = req.params;

        if (!searchTerms.length) {
            res.json([]);
            return;
        }

        const result = await trendsService.search(searchTerms, parseInt(page), parseInt(limit));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

TrendsController.post('/home/categories', checkToken(false), async (req: Request, res: Response, next: NextFunction) => {
    const result = await trendsService.getHomeCategories(TokenHelper.getPayload(res)?.userId, req.body.coords, req.body.clientAddress);
    res.json(result);
})

TrendsController.post('/autocompletes', checkToken(false), async (req: Request, res: Response, next: NextFunction) => {
    const result = await trendsService.getAutocompletes(TokenHelper.getPayload(res)?.userId, req.body.term);
    res.json(result);
})

TrendsController.post('/home/category/:categoryId/:page/:limit', checkToken(false), async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId, page, limit } = req.params;
    const terms: string[] = req.body.terms;

    switch (categoryId) {
        case 'topWeek':
            res.json(await trendsService.getTopWeek(terms, parseInt(page), parseInt(limit)))
            break;
        case 'likeYou':
            res.json(await trendsService.getLikeYou(terms, TokenHelper.getPayload(res)?.userId, parseInt(page), parseInt(limit)))
            break;
        case 'likeYourFollows':
            res.json(await trendsService.getLikeYourFollows(terms, TokenHelper.getPayload(res)?.userId, parseInt(page), parseInt(limit)))
            break;
        case 'recent':
            res.json(await trendsService.getRecents(terms, TokenHelper.getPayload(res)?.userId, parseInt(page), parseInt(limit)))
            break;
        case 'nearToYou':
            res.json(await trendsService.getNearToYou(terms,
                req.body.coords,
                req.body.clientAddress,
                TokenHelper.getPayload(res)?.userId,
                parseInt(page),
                parseInt(limit))
            );
            break;
    }
})

export { TrendsController };