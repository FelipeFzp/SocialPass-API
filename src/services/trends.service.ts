import { injectable } from "inversify";
import * as moment from 'moment-timezone';
import { Types } from "mongoose";
import { Coordinates } from "../models/others/coordinates";
import { Card } from "../models/schemas/card";
import { CardAccess } from "../models/schemas/card-access";
import { CardCategory } from "../models/schemas/card-category";
import { IUser, User, UserToViewModel } from "../models/schemas/user";
import { CardViewModel } from "../models/view-models/card.view-model";
import { TrendsHomeCategoriesViewModel } from "../models/view-models/trends-home-categories.view-model";
import { UserViewModel } from "../models/view-models/user.view-model";
import * as geoIp from 'geoip-lite';
import { CoordinatesHelper } from "../common/helpers/coordinates.helper";
import { TrendsSearchAutocompleteViewModel } from "models/view-models/trends-search-autocomplete.view-model";

@injectable()
export class TrendsService {
    public searchJoins = [
        {
            $lookup: {
                from: 'cards',
                localField: 'card',
                foreignField: '_id',
                as: 'card'
            }
        },
        {
            $lookup: {
                from: 'cardcategories',
                localField: 'card.categories',
                foreignField: '_id',
                as: 'cardCategories'
            }
        },
        {
            $lookup: {
                from: 'cardaccesses',
                localField: 'card._id',
                foreignField: 'card',
                as: 'cardAccesses'
            }
        },
        {
            $lookup: {
                from: 'addresses',
                localField: 'card.address',
                foreignField: '_id',
                as: 'cardAddress'
            }
        }
    ]

    public searchPagination = (page: number, limit: number) => {
        return [
            { $skip: page * limit },
            { $limit: limit }
        ]
    }

    public searchCriterias = (termsLikeExp: RegExp[]) => {
        if (termsLikeExp?.length) {
            return {
                $match: {
                    $or: [
                        { name: { $in: termsLikeExp } },
                        { nickname: { $in: termsLikeExp } },
                        { 'cardCategories.name': { $in: termsLikeExp } },
                        { 'cardAddress.city': { $in: termsLikeExp } },
                        { 'cardAddress.region': { $in: termsLikeExp } },
                        { 'cardAddress.country': { $in: termsLikeExp } },
                    ]
                }
            };
        } else {
            return {
                $match: {}
            };
        }
    }

    public async search(terms: string[], page: number, limit: number): Promise<UserViewModel[]> {

        const termsLikeExp = terms.map(t => new RegExp(`${t}`, 'i'));
        const searchCriterias = this.searchCriterias(termsLikeExp);

        const usersIds = await User.aggregate([
            ...this.searchJoins,
            searchCriterias,
            {
                $project: {
                    _id: 1
                }
            },
            ...this.searchPagination(page, limit)
        ]);

        const users = await User.find({
            _id: { $in: usersIds.map(p => p._id) }
        })
            .populate('card');

        return users.map(user => user.toViewModel());
    }

    public async getHomeCategories(userId: string, coords: Coordinates, clientAddress: string): Promise<TrendsHomeCategoriesViewModel> {
        const data = await Promise.all([
            this.getTopWeek([], 0, 12),
            this.getLikeYou([], userId, 0, 12),
            this.getNearToYou([], coords, clientAddress, userId, 0, 12),
            this.getRecents([], userId, 0, 12),
            this.getLikeYourFollows([], userId, 0, 12),
        ]);

        return {
            topWeek: data[0],
            likeYou: data[1],
            nearToYou: data[2],
            recent: data[3],
            likeYourFollows: data[4]
        };
    }

    public async getAutocompletes(userId: string, term: string): Promise<TrendsSearchAutocompleteViewModel[]> {
        const usersNames: TrendsSearchAutocompleteViewModel[] = (await User.aggregate([
            { $match: { _id: { $ne: userId }, name: new RegExp(`${term}`, 'i') } },
            {
                $lookup: {
                    from: 'cards',
                    localField: 'card',
                    foreignField: '_id',
                    as: 'card'
                }
            },
            { $sort: { 'card.viewsCount': -1 } },
            { $project: { _id: 0, name: 1 } },
            { $limit: 3 }
        ])).map(p => ({
            label: p.name,
            type: 'userName'
        }));

        const categories: TrendsSearchAutocompleteViewModel[] = (await CardCategory.aggregate([
            { $match: { name: new RegExp(`${term}`, 'i') } },
            { $limit: 3 },
            { $project: { _id: 0, name: 1 } }
        ])).map(p => ({
            label: p.name,
            type: 'category'
        }));

        let results: TrendsSearchAutocompleteViewModel[] = [];

        results.push(...usersNames);
        results = results.slice(0, categories?.length ? 2 : 3);
        results.push(...categories);
        results = results.slice(0, 3);

        return results;
    }

    public async getTopWeek(terms: string[], page: number, limit: number): Promise<UserViewModel[]> {
        try {
            const termsLikeExp = terms.map(t => new RegExp(`${t}`, 'i'));
            const searchCriterias = this.searchCriterias(termsLikeExp);

            const weekAgoDate = moment().subtract(7, 'day').toDate();

            const cardsIds = await CardAccess.aggregate([
                {
                    $match: {
                        updatedAt: { $gte: weekAgoDate }
                    }
                },
                {
                    $group: {
                        _id: "$card",
                        count: {
                            $sum: "$count"
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                },
                ...this.searchPagination(page, limit)
            ])

            const usersIds = await User.aggregate([
                ...this.searchJoins,
                searchCriterias,
                {
                    $match: {
                        'card._id': { $in: cardsIds.map(p => p._id) }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                }
            ]);

            const users = await User.find({
                _id: { $in: usersIds.map(p => p._id) }
            })
                .populate('card');

            const orderedUsers: IUser[] = [];

            cardsIds.forEach(c => {
                const user = users.find(u => u.card._id.toHexString() == c._id.toHexString());

                if (user)
                    orderedUsers.push(user);
            })

            return orderedUsers.map(user => user.toViewModel());
        } catch {
            return [];
        }
    }

    public async getLikeYou(terms: string[], userId: string, page: number, limit: number): Promise<UserViewModel[]> {

        try {
            if (!userId)
                return [];

            const termsLikeExp = terms.map(t => new RegExp(`${t}`, 'i'));
            const searchCriterias = this.searchCriterias(termsLikeExp);

            const userCard = await User.findById(userId)
                .populate({
                    path: 'card',
                    populate: {
                        path: 'categories'
                    }
                });

            const usersIds = await User.aggregate([
                ...this.searchJoins,
                searchCriterias,
                {
                    $match: {
                        'cardCategories._id': { $in: userCard.card.categories.map(p => p._id) },
                        _id: { $ne: Types.ObjectId(userId) }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                },
                ...this.searchPagination(page, limit)
            ]);

            const users = await User.find({
                _id: { $in: usersIds.map(p => p._id) }
            })
                .populate('card');

            return users.map(user => user.toViewModel());
        } catch {
            return [];
        }
    }

    public async getLikeYourFollows(terms: string[], userId: string, page: number, limit: number): Promise<UserViewModel[]> {

        try {
            if (!userId)
                return [];

            const termsLikeExp = terms.map(t => new RegExp(`${t}`, 'i'));
            const searchCriterias = this.searchCriterias(termsLikeExp);

            const followingUsersCategoriesIds: Types.ObjectId[] = (await User.aggregate([
                { $match: { _id: Types.ObjectId(userId) } },
                { $project: { _id: 0, 'followerId': '$following.user' } },
                { $unwind: '$followerId' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'followerId',
                        foreignField: '_id',
                        as: 'follower'
                    }
                },
                { $project: { followerId: 1, followerCardId: '$follower.card' } },
                { $unwind: '$followerCardId' },
                {
                    $lookup: {
                        from: 'cards',
                        localField: 'followerCardId',
                        foreignField: '_id',
                        as: 'card'
                    }
                },
                { $project: { followingCategoryId: '$card.categories' } },
                { $unwind: '$followingCategoryId' },
                { $unwind: '$followingCategoryId' }
            ])).map(p => p.followingCategoryId);

            const followingUserIds: Types.ObjectId[] = (await User.aggregate([
                { $match: { _id: Types.ObjectId(userId) } },
                { $project: { _id: 0, followingId: '$following.user' } },
                { $unwind: '$followingId' }
            ])).map(p => p.followingId);

            const nonFollowingUsersIdsWithCategories: Types.ObjectId[] = (await User.aggregate([
                // This match remove already following users
                { $match: { _id: { $nin: followingUserIds } } },
                {
                    $lookup: {
                        from: 'cards',
                        localField: 'card',
                        foreignField: '_id',
                        as: 'card'
                    }
                },
                { $project: { 'cardCategories': '$card.categories' } },
                { $unwind: '$cardCategories' },
                // This match get just users with my following users categories
                { $match: { cardCategories: { $in: followingUsersCategoriesIds } } }
            ])).map(p => p._id)

            const usersIds = await User.aggregate([
                ...this.searchJoins,
                searchCriterias,
                { $match: { _id: { $in: nonFollowingUsersIdsWithCategories } } },
                { $project: { _id: 1 } },
                ...this.searchPagination(page, limit)
            ]);

            const users = await User.find({
                _id: { $in: usersIds.map(p => p._id) }
            })
                .populate('card');

            return users.map(user => user.toViewModel());
        } catch {
            return [];
        }
    }

    public async getRecents(terms: string[], userId: string, page: number, limit: number): Promise<UserViewModel[]> {

        try {
            if (!userId)
                return [];

            const termsLikeExp = terms.map(t => new RegExp(`${t}`, 'i'));
            const searchCriterias = this.searchCriterias(termsLikeExp);

            const userCard = await User.findById(userId);
            const cardsAccess = await CardAccess.aggregate([
                {
                    $match: {
                        user: Types.ObjectId(userId),
                        card: { $ne: userCard.card }
                    },
                },
                {
                    $group: {
                        _id: "$card",
                        lastAccess: {
                            $last: "$updatedAt"
                        }
                    }
                },
                {
                    $sort: {
                        lastAccess: -1
                    }
                },
                ...this.searchPagination(page, limit)
            ])

            const usersIds = await User.aggregate([
                ...this.searchJoins,
                searchCriterias,
                {
                    $match: {
                        'card._id': { $in: cardsAccess.map(p => p._id) }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                }
            ]);

            const users = await User.find({
                _id: { $in: usersIds.map(p => p._id) }
            })
                .populate('card');

            const orderedUsers: IUser[] = [];

            cardsAccess.map(p => p._id).forEach(cId => {
                const user = users.find(u => u.card._id.toHexString() == cId.toHexString());

                if (user)
                    orderedUsers.push(user);
            })

            return orderedUsers.map(user => user.toViewModel());
        }
        catch {
            return [];
        }
    }

    public async getNearToYou(
        terms: string[],
        coords: Coordinates,
        clientAddress: string,
        userId: string,
        page: number,
        limit: number
    ): Promise<UserViewModel[]> {

        try {
            let coordinates: Coordinates;

            if (coords) {
                coordinates = coords;
            } else {
                //TODO: implementar ip location

                // const [latitude, longitude] = geoIp.lookup(clientAddress).ll;

                // coordinates = {
                //     latitude,
                //     longitude
                // };
            }

            if (!coordinates || !coordinates.latitude || !coordinates.longitude)
                return [];

            const minMaxCoordinates = CoordinatesHelper.calculeMinMax(coordinates, 50);

            const termsLikeExp = terms.map(t => new RegExp(`${t}`, 'i'));
            const searchCriterias = this.searchCriterias(termsLikeExp);

            const usersIds = await User.aggregate([
                ...this.searchJoins,
                searchCriterias,
                {
                    $match: {
                        $and: [
                            { 'cardAddress.0.latitude': { $gte: minMaxCoordinates.min.latitude } },
                            { 'cardAddress.0.longitude': { $gte: minMaxCoordinates.min.longitude } },
                            { 'cardAddress.0.latitude': { $lte: minMaxCoordinates.max.latitude } },
                            { 'cardAddress.0.longitude': { $lte: minMaxCoordinates.max.longitude } },
                        ]
                    }
                },
                {
                    $match: {
                        _id: { $ne: Types.ObjectId(userId) }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                },
                ...this.searchPagination(page, limit)
            ])

            const users = await User.find({
                _id: { $in: usersIds.map(p => p._id) }
            })
                .populate('card');

            return users.map(user => user.toViewModel());
        } catch (error) {
            return [];
        }
    }
}