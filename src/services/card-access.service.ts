import { injectable } from "inversify";
import { CustomException } from "../common/exceptions/setup/custom.exception";
import { ICard } from "../models/schemas/card";
import { CardAccess } from "../models/schemas/card-access";

@injectable()
export class CardAccessService {

    public async registerAccess(clientAddress: string, card: ICard, userId?: string): Promise<{
        alreadyHasAccess: boolean
    }> {
        if (!clientAddress) return;

        const cardAccess = await CardAccess.findOne({
            ip: clientAddress,
            user: userId,
            card: card._id
        });

        const alreadyHasAccess = !!cardAccess;

        if (!cardAccess) {
            const newCardAccess = new CardAccess({
                ip: clientAddress,
                card: card._id,
                user: userId
            });

            await newCardAccess.save();
        } else {
            cardAccess.count++
            await cardAccess.save();
        }

        return {
            alreadyHasAccess
        };
    }
}