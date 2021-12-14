import { Document, Schema, model, Types } from 'mongoose';
import { TimeStamps } from './abstraction/time-stamps';
import { ToViewModel } from './abstraction/to-view-model';
import { EmailConfirmationViewModel } from '../view-models/email-confirmation.view-model';

export interface IEmailConfirmation extends Document, TimeStamps, ToViewModel<IEmailConfirmation, EmailConfirmationViewModel> {
    code: string;
    email: string;
    expiration: Date;
    used: boolean;
}

export const EmailConfirmationSchema: Schema = new Schema({
    code: { type: String, required: true },
    email: { type: String, required: true },
    expiration: { type: Date, required: true },
    used: { type: Boolean, required: true }
}, {
    timestamps: true
});

function toViewModel(t?: IEmailConfirmation): EmailConfirmationViewModel {
    const u: IEmailConfirmation = t || this;

    return {
        code: u.code,
        email: u.email,
        expiration: u.expiration,
        used: u.used,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }
}
EmailConfirmationSchema.methods.toViewModel = toViewModel;
export { toViewModel as UserToViewModel };

export const EmailConfirmation = model<IEmailConfirmation>('emailConfirmations', EmailConfirmationSchema);