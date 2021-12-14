import { Request, Response, NextFunction, Router } from "express";
import { ServicesCollection } from "../providers";
import { CardService } from "../services/card.service";
import { TokenHelper } from "../common/helpers/token.helper";
import { checkToken } from "../middlewares/check-token";
import { UploadedFile } from "express-fileupload";

const CardsController = Router();

const cardService = ServicesCollection.resolve(CardService);

CardsController.get('/my', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const card = await cardService.getByUser(TokenHelper.getPayload(res).userId)
        res.json(card);
    } catch (error) {
        next(error);
    }
});

CardsController.post('/background', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bg = req.files && req.files['image'] ? req.files['image'] : JSON.parse(req.body.colorRgb);

        const background = await cardService.setBackground(TokenHelper.getPayload(res).userId, bg);

        res.json(background);
    } catch (error) {
        next(error);
    }
});

CardsController.post('/background/blur', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let blurLevel = req.body.blur;
        if (blurLevel < 0)
            blurLevel = 0;

        const background = await cardService.setBackgroundBlur(TokenHelper.getPayload(res).userId, blurLevel);

        res.json(background);
    } catch (error) {
        next(error);
    }
});

CardsController.post('/addIcon', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const icon = await cardService.addIcon(req.body, TokenHelper.getPayload(res).userId);
        res.json(icon);
    } catch (error) {
        next(error);
    }
});

CardsController.put('/updateIcon', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const icon = await cardService.updateIcon(req.body, TokenHelper.getPayload(res).userId);
        res.json(icon);
    } catch (error) {
        next(error);
    }
});

CardsController.patch('/registerView', checkToken(false), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cardId, clientAddress } = req.body;
        const viewsCount = await cardService.registerView(cardId, clientAddress, TokenHelper.getPayload(res)?.userId);

        res.json(viewsCount);
    } catch (error) {
        next(error);
    }
});

CardsController.delete('/removeIcon/:iconKey', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await cardService.removeIcon(req.params.iconKey, TokenHelper.getPayload(res).userId);
        res.send();
    } catch (error) {
        next(error);
    }
});

CardsController.put('/updateIconOrder', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const icons = await cardService.updateIconOrder(req.body, TokenHelper.getPayload(res).userId);
        res.json(icons);
    } catch (error) {
        next(error);
    }
});

CardsController.put('/updateCategories', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await cardService.updateCategories(req.body, TokenHelper.getPayload(res).userId);
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

CardsController.put('/updateAddress', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await cardService.updateAddress(req.body, TokenHelper.getPayload(res).userId);
        res.json(address);
    } catch (error) {
        next(error);
    }
});

export { CardsController };