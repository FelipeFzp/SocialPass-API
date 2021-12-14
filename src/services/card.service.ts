import { inject, injectable } from "inversify";
import { CardViewModel } from "../models/view-models/card.view-model";
import { NotFoundException } from "../common/exceptions/not-fount.exception";
import { IUser, User } from "../models/schemas/user";
import { Card, ICard } from "../models/schemas/card";
import { UploadedFile } from "express-fileupload";
import { FileHelper } from "../common/helpers/file.helper";
import { FileService } from "./file.service";
import { CardBackgroundViewModel } from "../models/view-models/card-background.view-model";
import { CardIconViewModel } from "../models/view-models/card-icon.view-model";
import { CardIconInputModel } from "../models/input-models/card-icon.input-model";
import { SocialNetwork } from "../models/schemas/social-network";
import { CardIcon } from "../models/schemas/card-icon";
import { v4 as uuidV4 } from 'uuid';
import { ParamException } from "../common/exceptions/param.exception";
import { CardIconOrderInputModel } from "../models/input-models/card-icon-order.input-model";
import { ImageHelper } from "../common/helpers/image-helper";
import { CardAccess } from "../models/schemas/card-access";
import { CardAccessService } from "./card-access.service";
import { CardCategoryViewModel } from "models/view-models/card-category.view-model";
import { CardCategory } from "../models/schemas/card-category";
import { AddressViewModel } from "../models/view-models/address.view-model";
import { AddressInputModel } from "../models/input-models/address.input-model";
import { Address, IAddress } from "../models/schemas/address";
import { Types } from "mongoose";

@injectable()
export class CardService {

    constructor(
        @inject(FileService) private _fileService: FileService,
        @inject(CardAccessService) private _cardAccessService: CardAccessService,
    ) { }


    public async registerView(cardId: string, clientAddress: string, userId?: string): Promise<string> {
        const card = await Card.findById(cardId);
        card.viewsCount++;

        const accessResult = await this._cardAccessService.registerAccess(clientAddress, card, userId);

        if (!accessResult.alreadyHasAccess) {
            card.uniqueViewsCount++;
        }

        await card.save();

        return card.toViewModel().viewsCount;
    }

    public async getByUser(userId: string): Promise<CardViewModel> {
        const user = await User.findById(userId)
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
            })
            .populate({
                path: 'card',
                populate: {
                    path: 'address'
                }
            });

        const followersCount: number = (await User.aggregate([
            { $match: { 'following.user': Types.ObjectId(userId) } },
            { $count: 'count' },
            { $limit: 1 }
        ]))[0]?.count || 0;

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const cardViewModel = user.card.toViewModel();
        cardViewModel.followersCount = followersCount;

        return cardViewModel;
    }

    public async setBackground(userId: string, bg: UploadedFile | number[]): Promise<CardBackgroundViewModel> {

        const user = await User.findById(userId)
            .populate('card');

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const card = <ICard>user.card;

        const oldBg = card.background.image;

        if (Array.isArray(bg)) {
            card.background.image = null;
            card.background.colorRgb = bg;
            card.background.contrastColor = await ImageHelper.getHexContrastColor(bg);
        } else {
            const imageName = await this._fileService.save(bg);

            card.background.image = imageName;
            card.background.colorRgb = null;

            // TODO: dando erro no ImageHelper.getHexContrastColor, foi retirado calculo de contrast color para imagens e colocado overlay fixo no front
            // card.background.contrastColor = await ImageHelper.getHexContrastColor(FileHelper.getFilePath(imageName));
            card.background.contrastColor = '#ffffff';
        }

        await user.card.save();

        if (oldBg)
            this._fileService.delete(FileHelper.getFilePath(oldBg));

        return card.background.toViewModel();
    }

    public async setBackgroundBlur(userId: string, blurLevel: number): Promise<CardBackgroundViewModel> {

        const user = await User.findById(userId)
            .populate('card');

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const card = <ICard>user.card;

        card.background.blur = blurLevel;

        await user.card.save();

        return card.background.toViewModel();
    }

    public async addIcon(input: CardIconInputModel, userId: string): Promise<CardIconViewModel> {

        const user = await User.findById(userId).populate('card');

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const socialNetwork = await SocialNetwork.findById(input.socialNetworkId);

        if (!socialNetwork)
            throw new NotFoundException('Rede social não encontrada');

        if (socialNetwork.baseUrl && !input.nick)
            throw new ParamException('Nome de usuário é obrigatório para esta rede social');

        if (!socialNetwork.baseUrl && !input.link)
            throw new ParamException('Link é obrigatório para esta rede social');

        const icon = new CardIcon({
            key: uuidV4(),
            socialNetwork: socialNetwork.id,
            link: socialNetwork.baseUrl ? `${socialNetwork.baseUrl}/${input.nick}` : input.link,
            nick: socialNetwork.baseUrl ? input.nick : null,
            title: input.title,
            position: (<ICard>user.card).icons.length,
        });

        (<ICard>user.card).icons.push(icon);

        await (<ICard>user.card).save();

        return icon.toViewModel();
    }

    public async updateIcon(input: CardIconInputModel, userId: string): Promise<CardIconViewModel> {

        const user = await User.findById(userId).populate('card');

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const socialNetwork = await SocialNetwork.findById(input.socialNetworkId);

        if (!socialNetwork)
            throw new NotFoundException('Rede social não encontrada');

        if (socialNetwork.baseUrl && !input.nick)
            throw new ParamException('Nome de usuário é obrigatório para esta rede social');

        if (!socialNetwork.baseUrl && !input.link)
            throw new ParamException('Link é obrigatório para esta rede social');

        const icon = (<ICard>user.card).icons.find(ic => ic.key == input.key);

        if (!icon)
            throw new NotFoundException('Ícone não encontrado');

        icon.socialNetwork = socialNetwork.id;
        icon.link = socialNetwork.baseUrl ? `${socialNetwork.baseUrl}/${input.nick}` : input.link;
        icon.nick = socialNetwork.baseUrl ? input.nick : null;
        icon.title = input.title,

            await (<ICard>user.card).save();

        return icon.toViewModel();
    }

    public async removeIcon(iconKey: string, userId: string): Promise<void> {

        const user = await User.findById(userId).populate('card');

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        const icon = (<ICard>user.card).icons.find(ic => ic.key == iconKey);

        if (!icon)
            throw new NotFoundException('Ícone não encontrado');

        (<ICard>user.card).icons.forEach(ic => {
            if (ic.position > icon.position)
                ic.position--;
        });

        (<ICard>user.card).icons.splice((<ICard>user.card).icons.findIndex(ic => ic.key == iconKey), 1);

        await (<ICard>user.card).save();
    }

    public async updateIconOrder(input: CardIconOrderInputModel, userId: string): Promise<CardIconViewModel[]> {

        const user = await User.findById(userId)
            .populate({
                path: 'card',
                populate: {
                    path: 'icons',
                    populate: {
                        path: 'socialNetwork'
                    }
                }
            });

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        // if (input.from < input.to) {
        //     for (let i = input.from; i <= input.to; i++) {
        //         if (i == input.from)
        //             (<ICard>user.card).icons[i].position = input.to;
        //         else
        //             (<ICard>user.card).icons[i].position--;
        //     }
        // } else {
        //     for (let i = input.from; i >= input.to; i--) {
        //         if (i == input.from)
        //             (<ICard>user.card).icons[i].position = input.to;
        //         else
        //             (<ICard>user.card).icons[i].position++;
        //     }
        // }

        const itemMove = (<ICard>user.card).icons.splice(input.from, 1)[0];
        (<ICard>user.card).icons.splice(input.to, 0, itemMove);

        (<ICard>user.card).icons.forEach((ic, i) => ic.position = i);

        await (<ICard>user.card).save();

        return (<ICard>user.card).icons.map(ic => ic.toViewModel());
    }

    public async updateCategories(categoriesIDs: string[], userId: string): Promise<CardCategoryViewModel[]> {
        const user = await User.findById(userId)
            .populate({
                path: 'card',
                populate: {
                    path: 'categories'
                }
            });

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        if (categoriesIDs.length > 3)
            throw new ParamException('Limite de 3 categorias excedido');

        const categories = await CardCategory.find({
            _id: {
                $in: categoriesIDs
            }
        });

        if (categories.length != categoriesIDs.length)
            throw new ParamException('A seleção de categorias contém categorias inválidas ou inexistentes');

        (<ICard>user.card).categories = categoriesIDs;
        (<ICard>user.card).save();

        return categories.map(c => c.toViewModel());
    }

    public async updateAddress(input: AddressInputModel, userId: string): Promise<AddressViewModel> {

        const user: IUser = await User.findById(userId)
            .populate({
                path: 'card',
                populate: {
                    path: 'address'
                }
            });

        if (!user)
            throw new NotFoundException('Usuário não encontrado');

        let address: IAddress;

        if ((<ICard>user.card).address) {
            user.card.address.description = input.description;
            user.card.address.zipCode = input.zipCode;
            user.card.address.city = input.city;
            user.card.address.region = input.region;
            user.card.address.country = input.country;
            user.card.address.complement = input.complement;
            user.card.address.referencePoint = input.referencePoint;
            user.card.address.latitude = input.latitude;
            user.card.address.longitude = input.longitude;

            address = user.card.address;
            await address.save();
        } else {
            address = new Address({
                description: input.description,
                zipCode: input.zipCode,
                city: input.city,
                region: input.region,
                country: input.country,
                complement: input.complement,
                referencePoint: input.referencePoint,
                latitude: input.latitude,
                longitude: input.longitude
            });

            (<ICard>user.card).address = address.id;

            await (<ICard>user.card).save();
            await address.save();
        }

        return address.toViewModel();
    }
}