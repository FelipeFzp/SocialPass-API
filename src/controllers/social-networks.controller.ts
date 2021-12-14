import { Request, Response, NextFunction, Router } from "express";
import { ServicesCollection } from "../providers";
import { checkToken } from "../middlewares/check-token";
import { SocialNetworkService } from "../services/social-network.service";

const SocialNetworksController = Router();

const socialNetworkService = ServicesCollection.resolve(SocialNetworkService);

SocialNetworksController.get('/', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const socialNetworks = await socialNetworkService.getAll();
        res.json(socialNetworks);
    } catch (error) {
        next(error);
    }
});

export { SocialNetworksController };