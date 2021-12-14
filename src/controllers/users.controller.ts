import { Request, Response, NextFunction, Router } from "express";
import { ServicesCollection } from "../providers";
import { UserService } from "../services/user.service";
import { UserRegisterInputModel } from "../models/input-models/user-register.input-model";
import { UserInputModel } from "../models/input-models/user.input-model";
import { checkToken } from "../middlewares/check-token";
import { TokenHelper } from "../common/helpers/token.helper";

const UsersController = Router();

const userService = ServicesCollection.resolve(UserService);

UsersController.put('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: UserInputModel = req.body;
        const image = req.files ? req.files['image'] : null;

        const user = await userService.update(input, image);

        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.get('/nicknameExists/:nickname', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.nicknameExists(req.params.nickname, <string>req.query.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/follow/:userId/:following', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const card = await userService.toggleFollow(TokenHelper.getPayload(res).userId, req.params.userId, req.params.following == "true")
        res.json(card);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/cards/following', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getFollowingCards(
            TokenHelper.getPayload(res).userId,
            parseInt(req.body.page, 0),
            parseInt(req.body.limit, 0),
            req.body.searchTerms
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/cards/followers', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getFollowersCards(
            TokenHelper.getPayload(res).userId,
            parseInt(req.body.page, 0),
            parseInt(req.body.limit, 0),
            req.body.searchTerms
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

UsersController.get('/followInfos', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getFollowInfos(TokenHelper.getPayload(res).userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/linkedinProfile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getLinkedinProfile(req.body.token, req.body.redirectUrl);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

UsersController.get('/nickname/:nickname', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getByNickname(req.params.nickname);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/sendEmailConfirmation', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.sendEmailConfirmation(req.body.email);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/confirmEmail', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.confirmEmail(req.body.email, req.body.code);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/sendLostPasswordEmail', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.sendLostPasswordEmail(req.body.email);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/confirmLostPasswordEmail', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.confirmLostPasswordEmail(req.body.email, req.body.code);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/changePassword', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.changePassword({ ...req.body });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.post('/recoverPassword', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.changePassword({ ...req.body });
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/unlinkAccount/google', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.unlinkGoogleAccount(req.body.googleUserId, TokenHelper.getPayload(res).userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/unlinkAccount/facebook', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.unlinkFacebookAccount(req.body.facebookUserId, TokenHelper.getPayload(res).userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/unlinkAccount/linkedin', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.unlinkLinkedinAccount(req.body.linkedinUserId, TokenHelper.getPayload(res).userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/linkAccount/google', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.linkGoogleAccount(req.body.googleUserId, TokenHelper.getPayload(res).userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/linkAccount/facebook', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.linkFacebookAccount(req.body.facebookUserId, TokenHelper.getPayload(res).userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

UsersController.patch('/linkAccount/linkedin', checkToken(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.linkLinkedinAccount(req.body.linkedinUserId, TokenHelper.getPayload(res).userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

export { UsersController };