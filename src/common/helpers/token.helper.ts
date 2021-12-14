import { Response } from "express";
import { Types } from "mongoose";

export class TokenHelper {
    public static getPayload(res: Response): TokenPayload {
        const payload = res.locals?.jwtPayload;
        return payload;
    }
}

export interface TokenPayload {
    userId: string;
}