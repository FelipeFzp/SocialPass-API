import { inject, injectable } from "inversify";
import { LoginInputModel } from "../models/input-models/login.input-model";
import { UserTokenViewModel } from "../models/view-models/user-token.view-model";
import { NotFoundException } from "../common/exceptions/not-fount.exception";
import * as bcrypt from 'bcryptjs';
import { AuthException } from "../common/exceptions/auth.exception";
import * as jwt from 'jsonwebtoken';
import { CONFIG } from "../config";
import { TokenPayload } from "../common/helpers/token.helper";
import { User, IUser } from "../models/schemas/user";
import { LoginFacebookInputModel } from "../models/input-models/login-facebook.input-model";
import { Card } from "../models/schemas/card";
import { UserService } from "./user.service";
import { UserRegisterInputModel } from "../models/input-models/user-register.input-model";
import { UploadedFile } from "express-fileupload";
import { AlreadyExistsException } from "../common/exceptions/already-exists.exception";
import { FileService } from "./file.service";
import { LoginGoogleInputModel } from "../models/input-models/login-google.input-model";
import { LoginLinkedinInputModel } from "../models/input-models/login-linkedin.input-model";

@injectable()
export class AuthService {

    constructor(
        private _userService: UserService,
        private _fileService: FileService
    ) { }

    public async register(input: UserRegisterInputModel, image?: UploadedFile): Promise<UserTokenViewModel> {

        if (input.password?.length <= 4)
            throw new Error('A senha precisa ter no minimo 4 dígitos');

        if (await User.exists({ email: input.email }))
            throw new AlreadyExistsException('Este e-mail já está sendo usado');

        if (await User.exists({ nickname: input.nickname }))
            throw new AlreadyExistsException('Este nome de usuário já está sendo usado');

        const card = new Card({
            background: {
                colorRgb: [39, 34, 71],
                contrastColor: '#ffffff'
            },
            icons: [],
        });

        await card.save();

        let imageFileName: string = image ? await this._fileService.save(image) : null;

        const user = new User({
            name: input.name,
            email: input.email,
            nickname: input.nickname.replace(/ /g, ''),
            bio: `Olá, meu nome é ${input.name.split(' ')[0]}!`,
            password: input.password ? bcrypt.hashSync(input.password) : null,
            image: imageFileName,
            card: card.id
        });

        await user.save();

        return {
            user: user.toViewModel(),
            token: this.generateToken(user)
        }
    }

    public async login(input: LoginInputModel): Promise<UserTokenViewModel> {

        const user = await User.findOne({ email: input.email });

        if (!user)
            throw new NotFoundException('E-mail ou senha inválida');

        if (!user.password)
            throw new AuthException('E-mail ou senha inválida');

        if (!bcrypt.compareSync(input.password, user.password))
            throw new AuthException('E-mail ou senha inválida');

        return {
            user: user.toViewModel(),
            token: this.generateToken(user)
        };
    }

    public async loginWithFacebook(input: LoginFacebookInputModel): Promise<UserTokenViewModel> {
        if (!input.email) {
            throw new Error('Falha ao fazer login com Facebook pois a conta não possui um email.');
        }
        if (!input.userId) {
            throw new Error('Falha ao fazer login com Facebook pois a conta não possui um ID.');
        }
        if (!input.fullName) {
            throw new Error('Falha ao fazer login com Facebook pois a conta não possui seu Nome completo.');
        }

        let user = await User.findOne({ email: input.email });

        if (user && !user.facebookUserId) {
            user.facebookUserId = input.userId;
            await user.save();
        }

        if (!user) {
            const card = new Card({
                background: {
                    colorRgb: [54, 88, 153],
                    contrastColor: '#ffffff'
                },
                icons: [],
            });

            let nickName = input.email.split('@')[0];
            let nickNameAlreadyExists = false;
            let nickNameIndex = 1;
            do {
                nickNameAlreadyExists = (await this._userService.nicknameExists(nickName)).exists;
                if (nickNameAlreadyExists) {
                    nickName += nickNameIndex;
                    nickNameIndex = nickNameIndex + 1;
                }
            } while (nickNameAlreadyExists);

            await card.save();
            user = new User({
                name: input.fullName,
                email: input.email,
                nickname: nickName,
                bio: `Olá, meu nome é ${input.fullName.split(' ')[0]}!`,
                password: null,
                image: null,
                card: card.id,
                facebookUserId: input.userId
            });
            await user.save();
        }

        return {
            user: user.toViewModel(),
            token: this.generateToken(user)
        };
    }

    public async loginWithGoogle(input: LoginGoogleInputModel): Promise<UserTokenViewModel> {
        if (!input.email) {
            throw new Error('Falha ao fazer login com Google pois a conta não possui um email.');
        }
        if (!input.userId) {
            throw new Error('Falha ao fazer login com Google pois a conta não possui um ID.');
        }
        if (!input.fullName) {
            throw new Error('Falha ao fazer login com Google pois a conta não possui seu Nome completo.');
        }

        let user = await User.findOne({ email: input.email });

        if (user && !user.googleUserId) {
            user.googleUserId = input.userId;
            await user.save();
        }

        if (!user) {
            const card = new Card({
                background: {
                    colorRgb: [181, 65, 42],
                    contrastColor: '#ffffff'
                },
                icons: [],
            });

            let nickName = input.email.split('@')[0];
            let nickNameAlreadyExists = false;
            let nickNameIndex = 1;
            do {
                nickNameAlreadyExists = (await this._userService.nicknameExists(nickName)).exists;
                if (nickNameAlreadyExists) {
                    nickName += nickNameIndex;
                    nickNameIndex = nickNameIndex + 1;
                }
            } while (nickNameAlreadyExists);

            await card.save();
            user = new User({
                name: input.fullName,
                email: input.email,
                nickname: nickName,
                bio: `Olá, meu nome é ${input.fullName.split(' ')[0]}!`,
                password: null,
                image: null,
                card: card.id,
                googleUserId: input.userId
            });
            await user.save();
        }

        return {
            user: user.toViewModel(),
            token: this.generateToken(user)
        };
    }

    public async loginWithLinkedin(input: LoginLinkedinInputModel): Promise<UserTokenViewModel> {
        if (!input.email) {
            throw new Error('Falha ao fazer login com Linkedin pois a conta não possui um email.');
        }
        if (!input.userId) {
            throw new Error('Falha ao fazer login com Linkedin pois a conta não possui um ID.');
        }
        if (!input.fullName) {
            throw new Error('Falha ao fazer login com Linkedin pois a conta não possui seu Nome completo.');
        }

        let user = await User.findOne({ email: input.email });

        if (user && !user.linkedinUserId) {
            user.linkedinUserId = input.userId;
            await user.save();
        }

        if (!user) {
            const card = new Card({
                background: {
                    colorRgb: [0, 63, 103],
                    contrastColor: '#ffffff'
                },
                icons: [],
            });

            let nickName = input.email.split('@')[0];
            let nickNameAlreadyExists = false;
            let nickNameIndex = 1;
            do {
                nickNameAlreadyExists = (await this._userService.nicknameExists(nickName)).exists;
                if (nickNameAlreadyExists) {
                    nickName += nickNameIndex;
                    nickNameIndex = nickNameIndex + 1;
                }
            } while (nickNameAlreadyExists);

            await card.save();
            user = new User({
                name: input.fullName,
                email: input.email,
                nickname: nickName,
                bio: `Olá, meu nome é ${input.fullName.split(' ')[0]}!`,
                password: null,
                image: null,
                card: card.id,
                googleUserId: input.userId
            });
            await user.save();
        }

        return {
            user: user.toViewModel(),
            token: this.generateToken(user)
        };
    }

    public async refresh(tokenPayload: TokenPayload) {
        const user = await User.findById(tokenPayload.userId);

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const token = this.generateToken(user);

        return {
            user: user.toViewModel(),
            token
        };
    }

    public generateToken(user: IUser): string {

        const payload: TokenPayload = { userId: user._id };

        const token = jwt.sign(
            payload,
            CONFIG.JWT_SECRET,
            { expiresIn: "120h" }
        );

        return token;
    }
}