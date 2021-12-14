import { Document, Schema, model, Types } from 'mongoose';
import { EmailLostPasswordViewModel } from '../view-models/email-lost-password.view-model';
import { TimeStamps } from './abstraction/time-stamps';
import { ToViewModel } from './abstraction/to-view-model';

export interface IEmailLostPassword extends Document, TimeStamps, ToViewModel<IEmailLostPassword, EmailLostPasswordViewModel> {
    code: string;
    email: string;
    expiration: Date;
    used: boolean;
}

export const EmailLostPasswordSchema: Schema = new Schema({
    code: { type: String, required: true },
    email: { type: String, required: true },
    expiration: { type: Date, required: true },
    used: { type: Boolean, required: true }
}, {
    timestamps: true
});

function toViewModel(t?: IEmailLostPassword): EmailLostPasswordViewModel {
    const u: IEmailLostPassword = t || this;

    return {
        code: u.code,
        email: u.email,
        expiration: u.expiration,
        used: u.used,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }
}
EmailLostPasswordSchema.methods.toViewModel = toViewModel;
export { toViewModel as UserToViewModel };

export const EmailLostPassword = model<IEmailLostPassword>('emailLostPassword', EmailLostPasswordSchema);