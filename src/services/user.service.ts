import { injectable } from "inversify";
import { IUser, User, UserToViewModel } from "../models/schemas/user";
import { UserViewModel } from "../models/view-models/user.view-model";
import * as bcrypt from 'bcryptjs';
import { UploadedFile } from "express-fileupload";
import { FileService } from "./file.service";
import { UserInputModel } from "../models/input-models/user.input-model";
import { NotFoundException } from "../common/exceptions/not-fount.exception";
import { AlreadyExistsException } from "../common/exceptions/already-exists.exception";
import { SecurityCodeHelper } from "../common/helpers/security-code.helper";
import { EmailConfirmation } from "../models/schemas/email-confirmation";
import { SecurityCodeEmail } from "../common/emails/security-code-email";
import * as nodemailer from 'nodemailer';
import * as moment from 'moment-timezone'
import * as axios from 'axios'
import { EmailLostPassword } from "../models/schemas/email-lost-password";
import { ChangePasswordInputModel } from "../models/input-models/change-password.input-model";
import { LostPasswordEmail } from "../common/emails/lost-password-email";
import { LinkedinUserViewModel } from "../models/view-models/linkedin-user.view-model";
import { CONFIG } from "../config";
import { IUserFollow, UserFollow } from "../models/schemas/user-follow";
import { FollowerSummaryViewModel } from "../models/view-models/follower-summary.view-model";
import { Types } from "mongoose";
import { UserFollowStatisticsViewModel } from "../models/view-models/user-follow-statistics.view-model";

@injectable()
export class UserService {
    constructor(
        private _fileService: FileService
    ) { }

    public async update(input: UserInputModel, image?: UploadedFile): Promise<UserViewModel> {

        const user = await User.findById(input.id);

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        if ((await this.nicknameExists(input.nickname, user.id)).exists)
            throw new AlreadyExistsException('Nome de usuário já está sendo usado');

        let imageFileName: string = image ? await this._fileService.save(image) : null;

        user.name = input.name;
        user.email = input.email;
        user.nickname = input.nickname.replace(/ /g, '');
        user.bio = input.bio;

        if (imageFileName)
            user.image = imageFileName;

        await user.save();

        return user.toViewModel();
    }

    public async nicknameExists(nickname: string, userId?: string): Promise<{ exists: boolean }> {

        const user = await User.findOne({ nickname });

        if (user && userId && user.id == userId)
            return { exists: false };

        return { exists: !!user };
    }

    public async toggleFollow(loggedUserId: string, userId: string, toFollow: boolean): Promise<void> {
        const user = await User.findById(loggedUserId);
        const existsUserToFollow = await User.exists({ _id: userId });

        if (!user || !existsUserToFollow) {
            throw new Error('Falha ao seguir este usuário.');
        }

        if (!user.following?.length) {
            user.following = [];
        }

        const following = user.following.find(f => f.user == userId);
        if (toFollow && !following) {
            const userFollow = new UserFollow({ user: userId });
            user.following.push(userFollow)

            await user.save();
            return;
        }

        if (!toFollow && following) {
            user.following = user.following.filter(f => f.user != userId);

            user.save();
            return;
        }
    }

    public async getFollowingCards(userId: string, page: number, limit: number, searchTerms: string): Promise<FollowerSummaryViewModel[]> {
        let aggregationQuery: any[] = [
            { $match: { _id: Types.ObjectId(userId) } },
            { $lookup: { from: 'users', localField: 'following.user', foreignField: '_id', as: 'following' } },
            { $project: { _id: 0, following: 1 } },
            { $unwind: "$following" }
        ]

        if (searchTerms?.length > 0) {
            aggregationQuery.push({ $match: { "following.name": new RegExp(`${searchTerms}`, 'i') } });
        }

        aggregationQuery.push(...[
            { $skip: page * limit },
            { $limit: limit }
        ])

        const follows: { following: IUser }[] = await User.aggregate(aggregationQuery);

        return follows.map(f => {
            const followingViewModel = UserToViewModel(f.following);

            return {
                name: followingViewModel.name,
                nickname: followingViewModel.nickname,
                bio: followingViewModel.bio,
                imageUrl: followingViewModel.imageUrl
            };
        })
    }

    public async getFollowersCards(userId: string, page: number, limit: number, searchTerms: string): Promise<FollowerSummaryViewModel[]> {
        let aggregationQuery: any[] = [
            { $match: { 'following.user': Types.ObjectId(userId) } }
        ]

        if (searchTerms?.length > 0) {
            aggregationQuery.push({ $match: { "name": new RegExp(`${searchTerms}`, 'i') } });
        }

        aggregationQuery.push(...[
            { $skip: page * limit },
            { $limit: limit }
        ])

        const follows: IUser[] = await User.aggregate(aggregationQuery);

        return follows.map(f => {
            const followingViewModel = UserToViewModel(f);

            return {
                name: followingViewModel.name,
                nickname: followingViewModel.nickname,
                bio: followingViewModel.bio,
                imageUrl: followingViewModel.imageUrl
            };
        })
    }

    public async getFollowInfos(userId: string): Promise<UserFollowStatisticsViewModel> {
        const followingCount: { count: number }[] = (await User.aggregate([
            { $match: { _id: Types.ObjectId(userId) } },
            { $unwind: "$following" },
            { $count: 'count' },
            { $limit: 1 }
        ]))[0]?.count || 0

        const followersCount = await User.find({ 'following.user': Types.ObjectId(userId) })
            .count();

        let NumAbbr = require('number-abbreviate');
        return {
            followingCount: new NumAbbr().abbreviate(followingCount || 0, 1),
            followersCount: new NumAbbr().abbreviate(followersCount, 1)
        };
    }

    public async unlinkGoogleAccount(googleUserId: string, userId: string): Promise<UserViewModel> {
        const user = await User.findById(userId);

        if (!user || user.googleUserId != googleUserId) {
            throw new Error('Falha ao desvincular a conta do Google com sua conta do XPass');
        }

        user.googleUserId = undefined;
        user.save();
        return user;
    }

    public async unlinkFacebookAccount(facebookUserId: string, userId: string): Promise<UserViewModel> {
        const user = await User.findById(userId);

        if (!user || user.facebookUserId != facebookUserId) {
            throw new Error('Falha ao desvincular a conta do Facebook com sua conta do XPass');
        }

        user.facebookUserId = undefined;
        user.save();
        return user;
    }

    public async unlinkLinkedinAccount(linkedinUserId: string, userId: string): Promise<UserViewModel> {
        const user = await User.findById(userId);

        if (!user || user.linkedinUserId != linkedinUserId) {
            throw new Error('Falha ao desvincular a conta do Linkedin com sua conta do XPass');
        }

        user.linkedinUserId = undefined;
        user.save();
        return user;
    }

    public async linkGoogleAccount(googleUserId: string, userId: string): Promise<UserViewModel> {
        const user = await User.findById(userId);

        if (!user || user.googleUserId) {
            throw new Error('Falha ao vincular a conta do Google com sua conta do XPass');
        }

        user.googleUserId = googleUserId;
        user.save();
        return user;
    }

    public async linkFacebookAccount(facebookUserId: string, userId: string): Promise<UserViewModel> {
        const user = await User.findById(userId);

        if (!user || user.facebookUserId) {
            throw new Error('Falha ao vincular a conta do Facebook com sua conta do XPass');
        }

        user.facebookUserId = facebookUserId;
        user.save();
        return user;
    }

    public async linkLinkedinAccount(linkedinUserId: string, userId: string): Promise<UserViewModel> {
        const user = await User.findById(userId);

        if (!user || user.linkedinUserId) {
            throw new Error('Falha ao vincular a conta do Linkedin com sua conta do XPass');
        }

        user.linkedinUserId = linkedinUserId;
        user.save();
        return user;
    }

    public async getLinkedinProfile(linkedinToken: string, redirectUrl: string): Promise<LinkedinUserViewModel> {
        try {
            const bearerTokenResult = (await axios.default.post('https://www.linkedin.com/oauth/v2/accessToken', {}, {
                headers: {
                    'Content-Type': 'x-www-form-urlencoded'
                },
                params: {
                    grant_type: "authorization_code",
                    code: linkedinToken,
                    redirect_uri: redirectUrl,
                    client_id: CONFIG.LINKEDIN_CLIENT_ID,
                    client_secret: CONFIG.LINKEDIN_CLIENT_SECRET
                }
            })).data;
            const authHeaders = { Authorization: `Bearer ${bearerTokenResult.access_token}` };

            const profileResult = (await axios.default.get('https://api.linkedin.com/v2/me', { headers: authHeaders })).data;
            const emailResult = (await axios.default.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', { headers: authHeaders })).data;

            const fullName = `${profileResult.localizedFirstName} ${profileResult.localizedLastName}`
            const email = emailResult.elements[0]['handle~'].emailAddress
            const linkedinUserId = profileResult.id;

            return {
                id: linkedinUserId,
                fullName,
                email
            }
        } catch (error) {
            throw new Error('Falha ao entrar com o Linkedin.');
        }
    }

    public async getByNickname(nickname: string): Promise<UserViewModel> {

        const user = await User.findOne({ nickname })
            .populate({
                path: 'card',
                populate: {
                    path: 'icons',
                    populate: {
                        path: 'socialNetwork'
                    }
                }
            })
            .populate({
                path: 'card',
                populate: {
                    path: 'categories'
                }
            });

        const followersCount: number = (await User.aggregate([
            { $match: { 'following.user': Types.ObjectId(user.id) } },
            { $count: 'count' },
            { $limit: 1 }
        ]))[0]?.count || 0;

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const userViewModel = user.toViewModel();
        userViewModel.card['followersCount'] = followersCount;

        return userViewModel;
    }

    public async sendEmailConfirmation(email: string): Promise<void> {
        const userExists = await User.exists({
            email: email
        });

        if (userExists) {
            throw new Error("Falha ao enviar email de confirmação");
        }

        const activeConfirmations = await EmailConfirmation.find({
            email: email,
            used: false
        });

        if (activeConfirmations?.length) {
            activeConfirmations.forEach(c => {
                c.used = true;
                c.save();
            })
        }

        const securityCode = SecurityCodeHelper.generate(4);
        const expirationDate = moment().add(15, 'minutes').toDate();
        const emailConfirmation = new EmailConfirmation({
            code: securityCode,
            email: email,
            expiration: expirationDate,
            used: false
        });

        await emailConfirmation.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "toikos.iot@gmail.com",
                pass: "Toikos@solutions"
            }
        });

        const mailOptions = {
            from: "no-reply@xpass.app",
            to: email,
            subject: "XPass - Confirmação de email",
            html: SecurityCodeEmail.getBody(securityCode)
        }

        await transporter.sendMail(mailOptions);
    }

    public async confirmEmail(email: string, code: string): Promise<void> {
        const verificationCode = await EmailConfirmation.findOne({
            email: email,
            used: false
        });

        if (!verificationCode) {
            throw new Error(`Código de verificação inválido.`);
        }

        if (verificationCode?.expiration < new Date()) {
            verificationCode.used = true;
            verificationCode.save();
            throw new Error(`Código de verificação inválido.`);
        }

        if (verificationCode.code != code) {
            throw new Error(`Código de verificação inválido.`);
        }

        const user = await User.findOne({
            email: email
        });

        if (user) {
            throw new Error(`Código de verificação inválido.`);
        }

        verificationCode.used = true;

        verificationCode.save();
    }

    public async sendLostPasswordEmail(email: string): Promise<void> {
        const userExists = await User.exists({
            email: email
        });

        if (!userExists) {
            throw new Error("Falha ao enviar email de recuperação.");
        }

        const activeRecoveries = await EmailLostPassword.find({
            email: email,
            used: false
        });

        if (activeRecoveries?.length) {
            for (const recovery of activeRecoveries) {
                recovery.used = true;
                await recovery.save();
            }
        }

        const securityCode = SecurityCodeHelper.generate(4);
        const expirationDate = moment().add(15, 'minutes').toDate();
        const emailRecovery = new EmailLostPassword({
            code: securityCode,
            email: email,
            expiration: expirationDate,
            used: false
        });

        await emailRecovery.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "toikos.iot@gmail.com",
                pass: "Toikos@solutions"
            }
        });

        const mailOptions = {
            from: "no-reply@xpass.app",
            to: email,
            subject: "XPass - Recuperação de senha",
            html: LostPasswordEmail.getBody(securityCode)
        }

        await transporter.sendMail(mailOptions);
    }

    public async confirmLostPasswordEmail(email: string, code: string): Promise<void> {
        const verificationCode = await EmailLostPassword.findOne({
            email: email,
            used: false
        });

        if (!verificationCode) {
            throw new Error(`Código de recuperação inválido.`);
        }

        if (verificationCode?.expiration < new Date()) {
            verificationCode.used = true;
            verificationCode.save();
            throw new Error(`Código de recuperação inválido.`);
        }

        if (verificationCode.code != code) {
            throw new Error(`Código de recuperação inválido.`);
        }
    }

    public async changePassword(input: ChangePasswordInputModel): Promise<void> {
        if (!input.recoveryPasswordCode && input.oldPassword == input.newPassword) {
            throw new Error('As senha deve ser diferente da antiga.');
        }

        if (input.newPassword?.length <= 4) {
            throw new Error('A senha precisa ter no minimo 4 dígitos');
        }

        const user = await User.findOne({ email: input.email });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (!input.recoveryPasswordCode && !bcrypt.compareSync(input.oldPassword, user.password)) {
            throw new Error('A senha antiga esta incorreta.');
        }

        if (input.recoveryPasswordCode) {
            const recovery = await EmailLostPassword.findOne({
                code: input.recoveryPasswordCode,
                email: user.email,
                used: false
            });

            if (!recovery) {
                throw new Error('Código de recuperação inválido.');
            }

            recovery.used = true;
            recovery.save();
        }

        user.password = bcrypt.hashSync(input.newPassword);
        user.save();
    }
}