import { injectable } from "inversify";
import { SocialNetwork } from "../models/schemas/social-network";
import { SocialNetworkViewModel } from "../models/view-models/social-network.view-model";

@injectable()
export class SocialNetworkService {

    public async getAll(): Promise<SocialNetworkViewModel[]> {

        const socialNetworks = await SocialNetwork.find().sort('title');

        return socialNetworks.map(sn => sn.toViewModel());
    }
}