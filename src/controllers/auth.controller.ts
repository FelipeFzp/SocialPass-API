import { Router } from "express";
import { ServicesCollection } from "../providers";
import { AuthService } from "../services/auth.service";
import { TokenHelper } from "../common/helpers/token.helper";
import { checkToken } from "../middlewares/check-token";
import { UserRegisterInputModel } from "../models/input-models/user-register.input-model";

const AuthController = Router();

const authService = ServicesCollection.resolve(AuthService);

AuthController.post('/register', async (req, res, next) => {
    try {
        const input: UserRegisterInputModel = req.body;
        const image = req.files ? req.files['image'] : null;

        const userToken = await authService.register(input, image);

        res.json(userToken);
    } catch (error) {
        next(error);
    }
});

AuthController.post('/login', async (req, res, next) => {
    try {
        const userToken = await authService.login(req.body);
        res.json(userToken);
    } catch (error) {
        next(error);
    }
});

AuthController.post('/login/facebook', async (req, res, next) => {
    try {
        const userToken = await authService.loginWithFacebook(req.body);
        res.json(userToken);
    } catch (error) {
        next(error);
    }
});

AuthController.post('/login/google', async (req, res, next) => {
    try {
        const userToken = await authService.loginWithGoogle(req.body);
        res.json(userToken);
    } catch (error) {
        next(error);
    }
});

AuthController.post('/login/linkedin', async (req, res, next) => {
    try {
        const userToken = await authService.loginWithLinkedin(req.body);
        res.json(userToken);
    } catch (error) {
        next(error);
    }
});

AuthController.post('/refresh', checkToken(), async (req, res, next) => {
    try {
        const userToken = await authService.refresh(TokenHelper.getPayload(res));
        res.json(userToken);
    } catch (error) {
        next(error);
    }
});

export { AuthController };