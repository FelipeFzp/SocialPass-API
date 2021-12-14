export class ChangePasswordInputModel {
    public recoveryPasswordCode?: string;
    public oldPassword?: string;
    public newPassword: string;
    public email: string;
}