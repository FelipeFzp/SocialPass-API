import { injectable } from "inversify";
import { FileHelper } from "../common/helpers/file.helper";
import { CardCollectionInputModel } from "../models/input-models/card-collection.input-model";
import { CardCollection } from "../models/schemas/card-collection";
import { IUser, User } from "../models/schemas/user";
import { CardCollectionViewModel } from "../models/view-models/card-collection.view-model";

@injectable()
export class CardCollectionService {

    public async getCollectionsWithCards(userId: string): Promise<CardCollectionViewModel[]> {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            throw new Error('Não foi possivel criar sua coleção, tente novamente mais tarde.');
        }

        const collections = await CardCollection.find({ user: userId });

        if (!collections?.length) {
            return [];
        }

        const cardsIds = collections.map(p => p.cards).find(c => c.length > 0) ?
            collections.map(p => p.cards)
                .reduce((a, b) => a.concat(b)) : [];

        const cardsInfos: IUser[] = await User.aggregate([
            { $match: { card: { $in: cardsIds } } },
            { $project: { name: 1, bio: 1, nickname: 1, image: 1, card: 1 } }
        ]);

        const collectionsViewModel = collections.map(p => p.toViewModel());
        collectionsViewModel.forEach(cc => {
            cc.cards = cardsInfos.filter(ci => cc.cardsIds.includes(ci.card))
                .map(c => {
                    const card = {
                        bio: c.bio,
                        imageUrl: c.image ? FileHelper.getUrl(c.image, 'app') : null,
                        name: c.name,
                        nickname: c.nickname
                    };

                    return card;
                })
        });

        return collectionsViewModel;
    }

    public async getAvailableCollections(userId: string): Promise<CardCollectionViewModel[]> {
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            throw new Error('Não foi possivel criar sua coleção, tente novamente mais tarde.');
        }

        const collections = await CardCollection.find({ user: userId });

        return await collections.map(p => p.toViewModel());
    }

    public async createCollection(collectionInput: CardCollectionInputModel, userId: string): Promise<CardCollectionViewModel> {
        const userExists = await User.exists({ _id: userId });
        const nameInUse = await CardCollection.exists({ user: userId, name: collectionInput?.name });

        if (!userExists) {
            throw new Error('Não foi possivel criar sua coleção, tente novamente mais tarde.');
        }

        if (nameInUse) {
            throw new Error(`Você ja tem uma coleção chamada ${collectionInput.name}, escolha outro nome.`);
        }

        if (!collectionInput?.name?.length) {
            throw new Error('Sua coleção precisa de um nome.');
        }

        const collection = new CardCollection({
            name: collectionInput.name,
            user: userId
        });

        await collection.save();
        return collection.toViewModel();
    }

    public async deleteCollection(collectionId: string, userId: string): Promise<void> {
        const userExists = await User.exists({ _id: userId });
        const collectionExists = await CardCollection.exists({ _id: collectionId, user: userId });

        if (!userExists) {
            throw new Error('Não foi possivel deletar sua coleção, tente novamente mais tarde.');
        }

        if (!collectionExists) {
            throw new Error('Falha ao deletar a coleção, está coleção não existe ou ja foi apagada.');
        }

        await CardCollection.findByIdAndDelete(collectionId);
    }

    public async toggleCardIntoCollection(collectionId: string, cardId: string, userId: string): Promise<void> {
        const userExists = await User.exists({ _id: userId });
        const collection = await CardCollection.findOne({ _id: collectionId, user: userId });

        if (!userExists) {
            throw new Error('Não foi possivel atualizar sua coleção, tente novamente mais tarde.');
        }

        if (!collection) {
            throw new Error('Falha ao adicionar cartão na coleção, coleção não encontrada');
        }

        if (collection.cards.includes(cardId)) {
            collection.cards = collection.cards.filter(cId => cId != cardId);
        } else {
            collection.cards.push(cardId);
        }

        await collection.save();
    }
}